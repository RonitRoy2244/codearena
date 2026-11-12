package com.codearena.backend;

import com.codearena.backend.model.Role;
import com.codearena.backend.model.User;
import com.codearena.backend.repository.ProblemRepository;
import com.codearena.backend.repository.UserRepository;
import com.codearena.backend.security.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class ProblemIntegrationTests {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
        problemRepository.findBySlug("multiply-two-numbers").ifPresent(problemRepository::delete);
    }

    @AfterEach
    void tearDown() {
        problemRepository.findBySlug("multiply-two-numbers").ifPresent(problemRepository::delete);
    }

    @Test
    void shouldListAllProblemsPublicly() throws Exception {
        mockMvc.perform(get("/api/problems"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", notNullValue()))
                .andExpect(jsonPath("$[*].slug", hasItems("sum-of-two-numbers", "reverse-a-string", "fizzbuzz")));
    }

    @Test
    void shouldGetProblemDetailWithOnlySampleTestCases() throws Exception {
        mockMvc.perform(get("/api/problems/sum-of-two-numbers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Sum of Two Numbers")))
                .andExpect(jsonPath("$.slug", is("sum-of-two-numbers")))
                .andExpect(jsonPath("$.difficulty", is("EASY")))
                .andExpect(jsonPath("$.sampleTestCases", hasSize(2)))
                .andExpect(jsonPath("$.sampleTestCases[0].input", is("3 4")))
                .andExpect(jsonPath("$.sampleTestCases[0].expectedOutput", is("7")))
                .andExpect(jsonPath("$.sampleTestCases[1].input", is("10 20")))
                .andExpect(jsonPath("$.sampleTestCases[1].expectedOutput", is("30")));
    }

    @Test
    void shouldReturn404ForNonExistentSlug() throws Exception {
        mockMvc.perform(get("/api/problems/non-existent-problem"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", is("Problem not found with slug: non-existent-problem")));
    }

    @Test
    void shouldDenyCreateProblemForUnauthenticated() throws Exception {
        String requestJson = """
                {
                    "title": "Two Sum",
                    "slug": "two-sum",
                    "description": "Find two numbers",
                    "difficulty": "EASY",
                    "timeLimitMs": 1000,
                    "testCases": [
                        {"input": "1 2", "expectedOutput": "3", "isSample": true}
                    ]
                }
                """;

        mockMvc.perform(post("/api/admin/problems")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldDenyCreateProblemForRegularUser() throws Exception {
        if (!userRepository.existsByUsername("regularuser")) {
            User user = new User();
            user.setUsername("regularuser");
            user.setEmail("regularuser@example.com");
            user.setPasswordHash(passwordEncoder.encode("Password@123"));
            user.setRole(Role.USER);
            userRepository.save(user);
        }

        String userToken = jwtService.generateToken("regularuser", "USER");

        String requestJson = """
                {
                    "title": "Two Sum",
                    "slug": "two-sum",
                    "description": "Find two numbers",
                    "difficulty": "EASY",
                    "timeLimitMs": 1000,
                    "testCases": [
                        {"input": "1 2", "expectedOutput": "3", "isSample": true}
                    ]
                }
                """;

        mockMvc.perform(post("/api/admin/problems")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldAllowCreateProblemForAdmin() throws Exception {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@codearena.com");
            admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
        }

        String adminToken = jwtService.generateToken("admin", "ADMIN");

        String requestJson = """
                {
                    "title": "Multiply Two Numbers",
                    "slug": "multiply-two-numbers",
                    "description": "Given two numbers a and b, output their product.",
                    "difficulty": "EASY",
                    "timeLimitMs": 1500,
                    "testCases": [
                        {"input": "2 3", "expectedOutput": "6", "isSample": true},
                        {"input": "0 5", "expectedOutput": "0", "isSample": false}
                    ]
                }
                """;

        mockMvc.perform(post("/api/admin/problems")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("Multiply Two Numbers")))
                .andExpect(jsonPath("$.slug", is("multiply-two-numbers")))
                .andExpect(jsonPath("$.sampleTestCases", hasSize(1)))
                .andExpect(jsonPath("$.sampleTestCases[0].input", is("2 3")))
                .andExpect(jsonPath("$.sampleTestCases[0].expectedOutput", is("6")));
    }
}
