package br.com.screi.service;

import java.util.List;

import br.com.screi.model.Cadastro;
import br.com.screi.repository.CadastroRepository;


public class TriagemService {

    private final CadastroRepository cadastroRepository;

    public TriagemService(CadastroRepository cadastroRepository) {
        this.cadastroRepository = cadastroRepository;
    }

    public List<Cadastro> listarFila() {
        
        throw new UnsupportedOperationException("TODO");
    }

    public void aprovar(Long id) {
      
    }

    public void reprovar(Long id, String justificativa) {
        
    }
}
