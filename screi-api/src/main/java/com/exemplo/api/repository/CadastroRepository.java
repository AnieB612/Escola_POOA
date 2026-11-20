package com.exemplo.api.repository;

import com.exemplo.api.model.Cadastro;
import com.exemplo.api.model.StatusCadastro;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CadastroRepository extends JpaRepository<Cadastro, Long> {

    List<Cadastro> findByUsuarioId(Long usuarioId);

    List<Cadastro> findByStatus(StatusCadastro status);

    List<Cadastro> findByStatusInOrderByDataEnvioAsc(Collection<StatusCadastro> status);

    /** Métodos conforme especificado no diagrama de classes UML */
    default Cadastro salvar(Cadastro cadastro) {
        return save(cadastro);
    }

    default Optional<Cadastro> buscarPorId(Long id) {
        return findById(id);
    }

    default List<Cadastro> buscarPorStatus(StatusCadastro status) {
        return findByStatus(status);
    }

    default List<Cadastro> buscarTodos() {
        return findAll();
    }
}
