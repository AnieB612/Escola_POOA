package br.com.screi.repository;

import java.util.List;
import java.util.Optional;

import br.com.screi.model.Cadastro;
import br.com.screi.model.enums.StatusCadastro;


public interface CadastroRepository {

    Cadastro salvar(Cadastro cadastro);

    Optional<Cadastro> buscarPorId(Long id);

    List<Cadastro> buscarPorStatus(StatusCadastro status);

    List<Cadastro> buscarTodos();
}
