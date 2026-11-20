package com.exemplo.api.model;

import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** Responsável pelo aluno. Faz parte do Cadastro (composição 1 para 1..*). */
@Embeddable
public class Responsavel {

    @NotBlank
    private String nome;
    @NotBlank
    private String cpf;
    @NotBlank
    private String parentesco;
    @NotBlank
    private String telefone;
    @Email
    private String email;

    @Embedded
    @Valid
    @NotNull
    private Endereco endereco;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public String getParentesco() { return parentesco; }
    public void setParentesco(String parentesco) { this.parentesco = parentesco; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Endereco getEndereco() { return endereco; }
    public void setEndereco(Endereco endereco) { this.endereco = endereco; }
}
