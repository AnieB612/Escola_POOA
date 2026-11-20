package com.exemplo.api.model;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;

/** Contato de emergência. Faz parte do Cadastro (composição 1 para 1..*). */
@Embeddable
public class ContatoEmergencia {

    @NotBlank
    private String nome;
    @NotBlank
    private String telefone;
    @NotBlank
    private String parentesco;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public String getParentesco() { return parentesco; }
    public void setParentesco(String parentesco) { this.parentesco = parentesco; }
}
