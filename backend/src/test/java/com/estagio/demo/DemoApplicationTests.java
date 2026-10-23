package com.estagio.demo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "api.security.token.secret=campusgrid-test-secret-with-at-least-32-characters")
class DemoApplicationTests {

	@Test
	void contextLoads() {
	}

}
