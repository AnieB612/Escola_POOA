package br.com.screi.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import br.com.screi.model.enums.StatusCadastro;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;


@Entity
public class Cadastro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusCadastro status = StatusCadastro.RASCUNHO;

    private LocalDateTime dataEnvio;

    
    private String justificativa;

   
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    private Aluno aluno;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "cadastro_id")
    private List<Responsavel> responsaveis = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "cadastro_id")
    private List<ContatoEmergencia> contatosEmergencia = new ArrayList<>();

    
    @ManyToOne
    private Usuario usuario;

   
    public void enviar() {
        if (status != StatusCadastro.RASCUNHO && status != StatusCadastro.COM_PENDENCIA) {
            throw new IllegalStateException(
                    "Só é possível enviar um cadastro em rascunho ou com pendência. Status atual: " + status);
        }
        validarCompleto();
        this.status = StatusCadastro.ENVIADO;
        this.dataEnvio = LocalDateTime.now();
        this.justificativa = null; 
    }

    
    public void iniciarAnalise() {
        exigirStatus(StatusCadastro.ENVIADO, "iniciar a análise");
        this.status = StatusCadastro.EM_ANALISE;
    }

    public void aprovar() {
        exigirStatus(StatusCadastro.EM_ANALISE, "aprovar");
        this.status = StatusCadastro.APROVADO;
    }

    
    public void reprovar(String justificativa) {
        exigirStatus(StatusCadastro.EM_ANALISE, "reprovar");
        if (justificativa == null || justificativa.isBlank()) {
            throw new IllegalArgumentException("A justificativa é obrigatória para reprovar um cadastro.");
        }
        this.justificativa = justificativa.trim();
        this.status = StatusCadastro.COM_PENDENCIA;
    }

    private void exigirStatus(StatusCadastro esperado, String acao) {
        if (status != esperado) {
            throw new IllegalStateException(
                    "Não é possível " + acao + ": o cadastro precisa estar em " + esperado
                            + " (status atual: " + status + ").");
        }
    }

    private void validarCompleto() {
        if (aluno == null) {
            throw new IllegalStateException("Preencha os dados do aluno antes de enviar.");
        }
        if (responsaveis.isEmpty()) {
            throw new IllegalStateException("Informe ao menos um responsável antes de enviar.");
        }
        if (contatosEmergencia.isEmpty()) {
            throw new IllegalStateException("Informe ao menos um contato de emergência antes de enviar.");
        }
    }



    public void adicionarResponsavel(Responsavel responsavel) {
        if (responsavel == null) {
            throw new IllegalArgumentException("Responsável não pode ser nulo.");
        }
        responsaveis.add(responsavel);
    }

    public void removerResponsavel(Responsavel responsavel) {
        responsaveis.remove(responsavel);
    }

    public void adicionarContatoEmergencia(ContatoEmergencia contato) {
        if (contato == null) {
            throw new IllegalArgumentException("Contato de emergência não pode ser nulo.");
        }
        contatosEmergencia.add(contato);
    }

    public void removerContatoEmergencia(ContatoEmergencia contato) {
        contatosEmergencia.remove(contato);
    }

    public Long getId() {
        return id;
    }

    public StatusCadastro getStatus() {
        return status;
    }

    public LocalDateTime getDataEnvio() {
        return dataEnvio;
    }

    public String getJustificativa() {
        return justificativa;
    }

    public Aluno getAluno() {
        return aluno;
    }

    public void setAluno(Aluno aluno) {
        this.aluno = aluno;
    }

    public List<Responsavel> getResponsaveis() {
        return Collections.unmodifiableList(responsaveis);
    }

    public List<ContatoEmergencia> getContatosEmergencia() {
        return Collections.unmodifiableList(contatosEmergencia);
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}
