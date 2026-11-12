package com.codearena.backend.config;

import com.codearena.backend.model.Difficulty;
import com.codearena.backend.model.Problem;
import com.codearena.backend.model.Role;
import com.codearena.backend.model.TestCase;
import com.codearena.backend.model.User;
import com.codearena.backend.repository.ProblemRepository;
import com.codearena.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, ProblemRepository problemRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.problemRepository = problemRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedAdminUser();
        seedProblems();
    }

    private void seedAdminUser() {
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@codearena.com");
            admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
        }
    }

    private void seedProblems() {
        if (problemRepository.count() == 0) {
            // 1. Sum of Two Numbers
            Problem sumProblem = new Problem();
            sumProblem.setTitle("Sum of Two Numbers");
            sumProblem.setSlug("sum-of-two-numbers");
            sumProblem.setDescription("Given two integers a and b separated by a space on a single line, calculate and print their sum.");
            sumProblem.setDifficulty(Difficulty.EASY);
            sumProblem.setTimeLimitMs(2000);
            sumProblem.addTestCase(new TestCase(sumProblem, "3 4", "7", true));
            sumProblem.addTestCase(new TestCase(sumProblem, "10 20", "30", true));
            sumProblem.addTestCase(new TestCase(sumProblem, "0 0", "0", false));
            sumProblem.addTestCase(new TestCase(sumProblem, "-5 5", "0", false));
            sumProblem.addTestCase(new TestCase(sumProblem, "100 250", "350", false));
            sumProblem.addTestCase(new TestCase(sumProblem, "-3 -4", "-7", false));
            problemRepository.save(sumProblem);

            // 2. Reverse a String
            Problem reverseProblem = new Problem();
            reverseProblem.setTitle("Reverse a String");
            reverseProblem.setSlug("reverse-a-string");
            reverseProblem.setDescription("Given a single line of text, print the reversed string.");
            reverseProblem.setDifficulty(Difficulty.EASY);
            reverseProblem.setTimeLimitMs(2000);
            reverseProblem.addTestCase(new TestCase(reverseProblem, "hello", "olleh", true));
            reverseProblem.addTestCase(new TestCase(reverseProblem, "abc", "cba", true));
            reverseProblem.addTestCase(new TestCase(reverseProblem, "a", "a", false));
            reverseProblem.addTestCase(new TestCase(reverseProblem, "racecar", "racecar", false));
            reverseProblem.addTestCase(new TestCase(reverseProblem, "Hello World", "dlroW olleH", false));
            reverseProblem.addTestCase(new TestCase(reverseProblem, "12345", "54321", false));
            problemRepository.save(reverseProblem);

            // 3. FizzBuzz
            Problem fizzBuzzProblem = new Problem();
            fizzBuzzProblem.setTitle("FizzBuzz");
            fizzBuzzProblem.setSlug("fizzbuzz");
            fizzBuzzProblem.setDescription("Given an integer n, print n lines from 1 to n. For multiples of 3, print 'Fizz'; for multiples of 5, print 'Buzz'; for multiples of both 3 and 5, print 'FizzBuzz'; otherwise print the number.");
            fizzBuzzProblem.setDifficulty(Difficulty.EASY);
            fizzBuzzProblem.setTimeLimitMs(2000);
            fizzBuzzProblem.addTestCase(new TestCase(fizzBuzzProblem, "3", "1\n2\nFizz", true));
            fizzBuzzProblem.addTestCase(new TestCase(fizzBuzzProblem, "5", "1\n2\nFizz\n4\nBuzz", true));
            fizzBuzzProblem.addTestCase(new TestCase(fizzBuzzProblem, "1", "1", false));
            fizzBuzzProblem.addTestCase(new TestCase(fizzBuzzProblem, "15", "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz", false));
            fizzBuzzProblem.addTestCase(new TestCase(fizzBuzzProblem, "10", "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz", false));
            fizzBuzzProblem.addTestCase(new TestCase(fizzBuzzProblem, "20", "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz", false));
            problemRepository.save(fizzBuzzProblem);
        }
    }
}
