package com.codearena.backend;

import com.codearena.backend.model.Role;
import com.codearena.backend.model.User;
import com.codearena.backend.repository.ProblemRepository;
import com.codearena.backend.repository.SubmissionRepository;
import com.codearena.backend.repository.UserRepository;
import com.codearena.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class SubmissionIntegrationTests {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private com.codearena.backend.service.SubmissionService submissionService;

    private MockMvc mockMvc;

    private User user1;
    private User user2;
    private String token1;
    private String token2;

    @BeforeEach
    void setUp() {
        submissionService.clearRateLimits();
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        submissionRepository.deleteAll();

        user1 = userRepository.findByUsername("judgeuser1").orElseGet(() -> {
            User u = new User();
            u.setUsername("judgeuser1");
            u.setEmail("judgeuser1@example.com");
            u.setPasswordHash(passwordEncoder.encode("Password@123"));
            u.setRole(Role.USER);
            return userRepository.save(u);
        });

        user2 = userRepository.findByUsername("judgeuser2").orElseGet(() -> {
            User u = new User();
            u.setUsername("judgeuser2");
            u.setEmail("judgeuser2@example.com");
            u.setPasswordHash(passwordEncoder.encode("Password@123"));
            u.setRole(Role.USER);
            return userRepository.save(u);
        });

        token1 = jwtService.generateToken(user1.getUsername(), user1.getRole().name());
        token2 = jwtService.generateToken(user2.getUsername(), user2.getRole().name());
    }

    @Test
    void shouldRunSampleCasesWithoutSaving() throws Exception {
        String jsSolution = """
                const fs = require('fs');
                const [a, b] = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);
                console.log(a + b);
                """;

        String requestJson = String.format("""
                {
                    "problemSlug": "sum-of-two-numbers",
                    "language": "JAVASCRIPT",
                    "sourceCode": %s
                }
                """, org.json.JSONObject.quote(jsSolution));

        mockMvc.perform(post("/api/run")
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verdict", is("ACCEPTED")))
                .andExpect(jsonPath("$.cases", hasSize(2)))
                .andExpect(jsonPath("$.cases[0].input", is("3 4")))
                .andExpect(jsonPath("$.cases[0].expected", is("7")))
                .andExpect(jsonPath("$.cases[0].actual", is("7\n")))
                .andExpect(jsonPath("$.cases[0].status", is("ACCEPTED")))
                .andExpect(jsonPath("$.cases[1].input", is("10 20")))
                .andExpect(jsonPath("$.cases[1].expected", is("30")))
                .andExpect(jsonPath("$.cases[1].actual", is("30\n")))
                .andExpect(jsonPath("$.cases[1].status", is("ACCEPTED")));

        assertEquals(0, submissionRepository.count());
    }

    @Test
    void shouldRejectRunCodeWhenUnauthenticated() throws Exception {
        String requestJson = """
                {
                    "problemSlug": "sum-of-two-numbers",
                    "language": "JAVASCRIPT",
                    "sourceCode": "console.log(1);"
                }
                """;

        mockMvc.perform(post("/api/run")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldSubmitAllCasesAndSave() throws Exception {
        String jsSolution = """
                const fs = require('fs');
                const [a, b] = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);
                console.log(a + b);
                """;

        String requestJson = String.format("""
                {
                    "problemSlug": "sum-of-two-numbers",
                    "language": "JAVASCRIPT",
                    "sourceCode": %s
                }
                """, org.json.JSONObject.quote(jsSolution));

        MvcResult result = mockMvc.perform(post("/api/submissions")
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.verdict", is("ACCEPTED")))
                .andExpect(jsonPath("$.passedCount", is(6)))
                .andExpect(jsonPath("$.totalCount", is(6)))
                .andExpect(jsonPath("$.errorText", nullValue()))
                .andExpect(jsonPath("$.testCases").doesNotExist())
                .andExpect(jsonPath("$.cases").doesNotExist())
                .andReturn();

        assertEquals(1, submissionRepository.count());

        // Test rate limit: immediate second submission should return 429
        mockMvc.perform(post("/api/submissions")
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.status", is(429)));
    }

    @Test
    void shouldStopAtFirstFailingCase() throws Exception {
        // Solution outputs fixed "7" -> passes sample 1 ("3 4" -> "7"), fails sample 2 ("10 20" -> "30")
        String wrongSolution = "console.log(7);";

        String requestJson = String.format("""
                {
                    "problemSlug": "sum-of-two-numbers",
                    "language": "JAVASCRIPT",
                    "sourceCode": %s
                }
                """, org.json.JSONObject.quote(wrongSolution));

        mockMvc.perform(post("/api/submissions")
                        .header("Authorization", "Bearer " + token2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.verdict", is("WRONG_ANSWER")))
                .andExpect(jsonPath("$.passedCount", is(1)))
                .andExpect(jsonPath("$.totalCount", is(6)));
    }

    @Test
    void shouldGetMySubmissionsWithoutSourceCode() throws Exception {
        String jsSolution = "console.log(0);";
        String requestJson = String.format("""
                {
                    "problemSlug": "sum-of-two-numbers",
                    "language": "JAVASCRIPT",
                    "sourceCode": %s
                }
                """, org.json.JSONObject.quote(jsSolution));

        MvcResult submitResult = mockMvc.perform(post("/api/submissions")
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isCreated())
                .andReturn();

        String responseStr = submitResult.getResponse().getContentAsString();
        long submissionId = Long.parseLong(responseStr.split("\"id\":")[1].split("[,}]")[0]);

        // GET /api/submissions/me
        mockMvc.perform(get("/api/submissions/me")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].problemSlug", is("sum-of-two-numbers")))
                .andExpect(jsonPath("$[0].sourceCode").doesNotExist());

        // GET /api/submissions/{id} by owner
        mockMvc.perform(get("/api/submissions/" + submissionId)
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is((int) submissionId)))
                .andExpect(jsonPath("$.sourceCode", is(jsSolution)));

        // GET /api/submissions/{id} by another user -> 403 Forbidden
        mockMvc.perform(get("/api/submissions/" + submissionId)
                        .header("Authorization", "Bearer " + token2))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));
    }
}
