package com.exemplo.api;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// banco em memória nos testes, para não mexer nos dados de ./data
@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:testes")
class ApiApplicationTests {

	@Test
	void contextLoads() {
	}

}
