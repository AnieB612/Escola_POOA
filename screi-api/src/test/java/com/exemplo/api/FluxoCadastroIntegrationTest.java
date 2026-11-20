package com.exemplo.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:fluxo_test")
@AutoConfigureMockMvc
class FluxoCadastroIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void deveExecutarFluxoCompletoDeCadastroTriagemEExportacao() throws Exception {
        String respJson = """
                {
                  "nome": "Ana Responsável",
                  "email": "ana@teste.com",
                  "senha": "senha123",
                  "perfil": "RESPONSAVEL"
                }
                """;
        MvcResult respResult = mockMvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON).content(respJson)).andExpect(status().isCreated()).andExpect(jsonPath("$.senhaHash").doesNotExist()).andReturn();

        Long responsavelId = objectMapper.readTree(respResult.getResponse().getContentAsString()).get("id").asLong();

        String funcJson = """
                {
                  "nome": "Carlos Secretaria",
                  "email": "carlos@teste.com",
                  "senha": "senha123",
                  "perfil": "FUNCIONARIO"
                }
                """;
        mockMvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON).content(funcJson)).andExpect(status().isCreated());

        String cadastroJson = """
                {
                  "usuarioId": %d,
                  "aluno": {
                    "nome": "Lucas Silva",
                    "dataNascimento": "2021-05-10",
                    "cpf": "12345678900",
                    "endereco": {
                      "cep": "42800000",
                      "logradouro": "Rua A",
                      "bairro": "Centro",
                      "cidade": "Camaçari",
                      "uf": "BA"
                    }
                  },
                  "responsaveis": [{
                    "nome": "Ana Silva",
                    "cpf": "98765432100",
                    "parentesco": "Mãe",
                    "telefone": "71999999999",
                    "email": "ana@teste.com",
                    "endereco": {
                      "cep": "42800000",
                      "logradouro": "Rua A",
                      "bairro": "Centro",
                      "cidade": "Camaçari",
                      "uf": "BA"
                    }
                  }],
                  "contatosEmergencia": [{
                    "nome": "João Silva",
                    "telefone": "71988888888",
                    "parentesco": "Pai"
                  }]
                }
                """.formatted(responsavelId);

        MvcResult cadResult = mockMvc.perform(post("/api/cadastros").with(httpBasic("ana@teste.com", "senha123")).contentType(MediaType.APPLICATION_JSON).content(cadastroJson)).andExpect(status().isCreated()).andReturn();

        JsonNode cadNode = objectMapper.readTree(cadResult.getResponse().getContentAsString());
        Long cadastroId = cadNode.get("id").asLong();

        mockMvc.perform(post("/api/cadastros/" + cadastroId + "/enviar").with(httpBasic("ana@teste.com", "senha123"))).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("ENVIADO"));

        mockMvc.perform(post("/api/triagem/" + cadastroId + "/aprovar").with(httpBasic("carlos@teste.com", "senha123"))).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("APROVADO"));

        mockMvc.perform(get("/api/exportacao").with(httpBasic("carlos@teste.com", "senha123"))).andExpect(status().isOk());
    }
}