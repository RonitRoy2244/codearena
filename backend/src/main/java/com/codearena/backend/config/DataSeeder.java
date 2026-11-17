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
        // 1. Sum of Two Numbers
        if (problemRepository.findBySlug("sum-of-two-numbers").isEmpty()) {
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
        }

        // 2. Reverse a String
        if (problemRepository.findBySlug("reverse-a-string").isEmpty()) {
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
        }

        // 3. FizzBuzz
        if (problemRepository.findBySlug("fizzbuzz").isEmpty()) {
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

        // 4. Palindrome Number
        if (problemRepository.findBySlug("palindrome-number").isEmpty()) {
            Problem palindromeProblem = new Problem();
            palindromeProblem.setTitle("Palindrome Number");
            palindromeProblem.setSlug("palindrome-number");
            palindromeProblem.setDescription("Given an integer `x` on a single line, return `true` if `x` is a palindrome, and `false` otherwise.\n\nAn integer is a palindrome when it reads the same forward and backward. For example, `121` is a palindrome while `123` and `-121` are not.");
            palindromeProblem.setDifficulty(Difficulty.EASY);
            palindromeProblem.setTimeLimitMs(2000);
            palindromeProblem.addTestCase(new TestCase(palindromeProblem, "121", "true", true));
            palindromeProblem.addTestCase(new TestCase(palindromeProblem, "-121", "false", true));
            palindromeProblem.addTestCase(new TestCase(palindromeProblem, "10", "false", true));
            palindromeProblem.addTestCase(new TestCase(palindromeProblem, "0", "true", false));
            palindromeProblem.addTestCase(new TestCase(palindromeProblem, "12321", "true", false));
            palindromeProblem.addTestCase(new TestCase(palindromeProblem, "1000021", "false", false));
            palindromeProblem.addTestCase(new TestCase(palindromeProblem, "7", "true", false));
            palindromeProblem.addTestCase(new TestCase(palindromeProblem, "12345654321", "true", false));
            palindromeProblem.addTestCase(new TestCase(palindromeProblem, "-101", "false", false));
            problemRepository.save(palindromeProblem);
        }

        // 5. Valid Parentheses
        if (problemRepository.findBySlug("valid-parentheses").isEmpty()) {
            Problem validParenProblem = new Problem();
            validParenProblem.setTitle("Valid Parentheses");
            validParenProblem.setSlug("valid-parentheses");
            validParenProblem.setDescription("Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.\n\nPrint `true` if valid, otherwise print `false`.");
            validParenProblem.setDifficulty(Difficulty.EASY);
            validParenProblem.setTimeLimitMs(2000);
            validParenProblem.addTestCase(new TestCase(validParenProblem, "()", "true", true));
            validParenProblem.addTestCase(new TestCase(validParenProblem, "()[]{}", "true", true));
            validParenProblem.addTestCase(new TestCase(validParenProblem, "(]", "false", true));
            validParenProblem.addTestCase(new TestCase(validParenProblem, "([)]", "false", false));
            validParenProblem.addTestCase(new TestCase(validParenProblem, "{[]}", "true", false));
            validParenProblem.addTestCase(new TestCase(validParenProblem, "]", "false", false));
            validParenProblem.addTestCase(new TestCase(validParenProblem, "(((", "false", false));
            validParenProblem.addTestCase(new TestCase(validParenProblem, "{[()]}", "true", false));
            validParenProblem.addTestCase(new TestCase(validParenProblem, "(([]){})", "true", false));
            problemRepository.save(validParenProblem);
        }

        // 6. Two Sum
        if (problemRepository.findBySlug("two-sum").isEmpty()) {
            Problem twoSumProblem = new Problem();
            twoSumProblem.setTitle("Two Sum");
            twoSumProblem.setSlug("two-sum");
            twoSumProblem.setDescription("Given an array of integers and an integer target, return the 0-based indices of the two numbers such that they add up to the target.\n\n**Input Format:**\n- Line 1: An integer `target`\n- Line 2: Space-separated integers representing the array `nums`\n\n**Output Format:**\n- Print the two 0-based indices separated by a space in ascending order (`i j`). You may assume that each input would have exactly one solution.");
            twoSumProblem.setDifficulty(Difficulty.EASY);
            twoSumProblem.setTimeLimitMs(2000);
            twoSumProblem.addTestCase(new TestCase(twoSumProblem, "9\n2 7 11 15", "0 1", true));
            twoSumProblem.addTestCase(new TestCase(twoSumProblem, "6\n3 2 4", "1 2", true));
            twoSumProblem.addTestCase(new TestCase(twoSumProblem, "6\n3 3", "0 1", true));
            twoSumProblem.addTestCase(new TestCase(twoSumProblem, "10\n1 2 3 4 5 6 7 8 9", "0 8", false));
            twoSumProblem.addTestCase(new TestCase(twoSumProblem, "0\n-3 4 3 90", "0 2", false));
            twoSumProblem.addTestCase(new TestCase(twoSumProblem, "-8\n-5 -3 10 20", "0 1", false));
            twoSumProblem.addTestCase(new TestCase(twoSumProblem, "100\n10 20 30 40 50 60 70", "2 5", false));
            problemRepository.save(twoSumProblem);
        }

        // 7. Maximum Subarray
        if (problemRepository.findBySlug("maximum-subarray").isEmpty()) {
            Problem maxSubProblem = new Problem();
            maxSubProblem.setTitle("Maximum Subarray");
            maxSubProblem.setSlug("maximum-subarray");
            maxSubProblem.setDescription("Given an integer array `nums` on a single line separated by spaces, find the contiguous subarray (containing at least one number) which has the largest sum, and print its sum (Kadane's Algorithm).");
            maxSubProblem.setDifficulty(Difficulty.MEDIUM);
            maxSubProblem.setTimeLimitMs(2000);
            maxSubProblem.addTestCase(new TestCase(maxSubProblem, "-2 1 -3 4 -1 2 1 -5 4", "6", true));
            maxSubProblem.addTestCase(new TestCase(maxSubProblem, "1", "1", true));
            maxSubProblem.addTestCase(new TestCase(maxSubProblem, "5 4 -1 7 8", "23", true));
            maxSubProblem.addTestCase(new TestCase(maxSubProblem, "-1", "-1", false));
            maxSubProblem.addTestCase(new TestCase(maxSubProblem, "-5 -2 -8 -1", "-1", false));
            maxSubProblem.addTestCase(new TestCase(maxSubProblem, "10 -5 10 -5 10", "20", false));
            maxSubProblem.addTestCase(new TestCase(maxSubProblem, "-2 -1", "-1", false));
            maxSubProblem.addTestCase(new TestCase(maxSubProblem, "1 2 3 4 -10 20", "20", false));
            problemRepository.save(maxSubProblem);
        }

        // 8. Binary Search
        if (problemRepository.findBySlug("binary-search").isEmpty()) {
            Problem binSearchProblem = new Problem();
            binSearchProblem.setTitle("Binary Search");
            binSearchProblem.setSlug("binary-search");
            binSearchProblem.setDescription("Given a target integer and a sorted integer array `nums` in ascending order, write a function to search `target` in `nums`. If `target` exists, print its 0-based index. Otherwise, print `-1`.\n\n**Input Format:**\n- Line 1: An integer `target`\n- Line 2: Space-separated sorted integers `nums`\n\n**Output Format:**\n- A single integer representing the 0-based index of `target`, or `-1`.");
            binSearchProblem.setDifficulty(Difficulty.EASY);
            binSearchProblem.setTimeLimitMs(2000);
            binSearchProblem.addTestCase(new TestCase(binSearchProblem, "9\n-1 0 3 5 9 12", "4", true));
            binSearchProblem.addTestCase(new TestCase(binSearchProblem, "2\n-1 0 3 5 9 12", "-1", true));
            binSearchProblem.addTestCase(new TestCase(binSearchProblem, "5\n5", "0", false));
            binSearchProblem.addTestCase(new TestCase(binSearchProblem, "-5\n5", "-1", false));
            binSearchProblem.addTestCase(new TestCase(binSearchProblem, "1\n1 2 3 4 5 6 7 8 9 10", "0", false));
            binSearchProblem.addTestCase(new TestCase(binSearchProblem, "10\n1 2 3 4 5 6 7 8 9 10", "9", false));
            binSearchProblem.addTestCase(new TestCase(binSearchProblem, "6\n2 4 6 8 10", "2", false));
            binSearchProblem.addTestCase(new TestCase(binSearchProblem, "100\n1 3 5 7 9", "-1", false));
            problemRepository.save(binSearchProblem);
        }
    }
}
