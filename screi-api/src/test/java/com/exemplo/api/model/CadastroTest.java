package com.exemplo.api.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class CadastroTest {

    @Test
    void deveEnviarCadastroEPreencherDataEnvio() {
        Cadastro cadastro = new Cadastro();

        cadastro.enviar();

        assertEquals(StatusCadastro.ENVIADO, cadastro.getStatus());
        assertNotNull(cadastro.getDataEnvio());
    }

    @Test
    void deveAprovarELimparJustificativaAnterior() {
        Cadastro cadastro = new Cadastro();
        cadastro.reprovar("Documento ilegível");

        cadastro.aprovar();

        assertEquals(StatusCadastro.APROVADO, cadastro.getStatus());
        assertNull(cadastro.getJustificativa());
    }

    @Test
    void deveLancarExcecaoAoReprovarSemJustificativa() {
        Cadastro cadastro = new Cadastro();

        assertThrows(IllegalArgumentException.class, () -> cadastro.reprovar("   "));
    }
}