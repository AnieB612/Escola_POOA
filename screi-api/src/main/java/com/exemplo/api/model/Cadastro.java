package com.exemplo.api.model;

import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Cadastro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusCadastro status = StatusCadastro.RASCUNHO;

    private LocalDateTime dataEnvio;

    @Column(length = 1000)
    private String justificativa;

    /** Usuário dono do cadastro: 1 usuário tem 0..* cadastros. */
    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Embedded
    @Valid
    @NotNull(message = "informe os dados do aluno")
    private Aluno aluno;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "cadastro_responsavel", joinColumns = @JoinColumn(name = "cadastro_id"))
    @OrderColumn(name = "ordem")
    @Valid
    @NotEmpty(message = "informe ao menos um responsável")
    private List<Responsavel> responsaveis = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "cadastro_contato_emergencia", joinColumns = @JoinColumn(name = "cadastro_id"))
    @OrderColumn(name = "ordem")
    @Valid
    @NotEmpty(message = "informe ao menos um contato de emergência")
    private List<ContatoEmergencia> contatosEmergencia = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public StatusCadastro getStatus() { return status; }
    public void setStatus(StatusCadastro status) { this.status = status; }
    public LocalDateTime getDataEnvio() { return dataEnvio; }
    public void setDataEnvio(LocalDateTime dataEnvio) { this.dataEnvio = dataEnvio; }
    public String getJustificativa() { return justificativa; }
    public void setJustificativa(String justificativa) { this.justificativa = justificativa; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public Aluno getAluno() { return aluno; }
    public void setAluno(Aluno aluno) { this.aluno = aluno; }
    public List<Responsavel> getResponsaveis() { return responsaveis; }
    public void setResponsaveis(List<Responsavel> responsaveis) { this.responsaveis = responsaveis; }
    public List<ContatoEmergencia> getContatosEmergencia() { return contatosEmergencia; }
    public void setContatosEmergencia(List<ContatoEmergencia> contatosEmergencia) { this.contatosEmergencia = contatosEmergencia; }

    /** Atualiza os blocos de uma etapa do formulário mantendo integridade das coleções */
    public void atualizarEtapa(Aluno aluno, List<Responsavel> novosResponsaveis, List<ContatoEmergencia> novosContatos) {
        if (aluno != null) {
            this.aluno = aluno;
        }
        if (novosResponsaveis != null) {
            this.responsaveis.clear();
            this.responsaveis.addAll(novosResponsaveis);
        }
        if (novosContatos != null) {
            this.contatosEmergencia.clear();
            this.contatosEmergencia.addAll(novosContatos);
        }
    }

    /** Métodos de domínio conforme diagrama UML e regras de negócio encapsuladas */
    public void enviar() {
        this.status = StatusCadastro.ENVIADO;
        this.dataEnvio = LocalDateTime.now();
    }

    public void aprovar() {
        this.status = StatusCadastro.APROVADO;
        this.justificativa = null;
    }

    public void reprovar(String justificativa) {
        if (justificativa == null || justificativa.isBlank()) {
            throw new IllegalArgumentException("Informe a justificativa da reprovação");
        }
        this.status = StatusCadastro.COM_PENDENCIA;
        this.justificativa = justificativa.trim();
    }
}
