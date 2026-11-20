package com.exemplo.api.repository;

import com.exemplo.api.model.Cadastro;
import com.exemplo.api.model.StatusCadastro;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CadastroRepository extends JpaRepository<Cadastro, Long> {

    List<Cadastro> findByUsuarioId(Long usuarioId);

    List<Cadastro> findByStatus(StatusCadastro status);

    List<Cadastro> findByStatusInOrderByDataEnvioAsc(Collection<StatusCadastro> status);
}
