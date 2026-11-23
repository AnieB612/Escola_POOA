package com.exemplo.api.model;

import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/** Dados do aluno. Faz parte do Cadastro (composição 1 para 1). */
@Embeddable
public class Aluno {

    @NotBlank
    private String nome;

    @NotNull
    private LocalDate dataNascimento;

    @NotBlank
    private String cpf;

    private String observacoesSaude;

    @Embedded
    @Valid
    @NotNull
    private Endereco endereco;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }
    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public String getObservacoesSaude() { return observacoesSaude; }
    public void setObservacoesSaude(String observacoesSaude) { this.observacoesSaude = observacoesSaude; }
    public Endereco getEndereco() { return endereco; }
    public void setEndereco(Endereco endereco) { this.endereco = endereco; }
}
