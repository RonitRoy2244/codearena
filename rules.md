Project: online coding judge (LeetCode-style), running locally.

Environment: Windows. Java 17, Node 24, MySQL from XAMPP (user root, empty password, database codearena).
Docker is NOT available. Python and C++ are NOT supported. Supported languages: JAVASCRIPT and JAVA.

Backend: Spring Boot 4.1.2, Spring Security 7, Java 17, Maven, Spring Data JPA, Spring Security with stateless JWT, MySQL.
Frontend: React + Vite, axios, react-router-dom, Bootstrap, @monaco-editor/react.

Rules:
- Backend stack: Spring Boot 4.1.2, Spring Security 7, and Java 17.
- Use current Spring Security APIs: the lambda DSL for HttpSecurity (no .and(), no antMatchers; use requestMatchers).
- If an API or dependency from Spring Boot 3 does not exist in Boot 4, check the Spring Boot 4 documentation instead of guessing.
- For JWT, use the jjwt library (version 0.12 or newer). If it conflicts with Jackson 3, use jjwt-gson.
- Layers: controller -> service -> repository. Use DTOs; never return entities from controllers.
- All settings live in application.properties.
- User code NEVER runs inside the Spring Boot process. It runs only through the CodeRunner interface.
  The current implementation is LocalProcessRunner. A DockerRunner (empty TODO) will be added later.
- Commands are built with ProcessBuilder and an argument list, never a shell string.
- Hidden test cases must never be returned by any API.
- Make small, focused changes. After each task, tell me exactly how to test it.
- Do not change files unrelated to the current task.
