package com.exemplo.api.service;

import com.exemplo.api.model.Usuario;
import com.exemplo.api.repository.UsuarioRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UsuarioService {

    private final UsuarioRepository repository;

    public UsuarioService(UsuarioRepository repository) {
        this.repository = repository;
    }

    public List<Usuario> listar() {
        return repository.findAll();
    }

    public Usuario buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> NegocioException.naoEncontrado("Usuário " + id + " não encontrado"));
    }

    public Usuario criar(Usuario usuario) {
        if (repository.existsByEmail(usuario.getEmail())) {
            throw new NegocioException(HttpStatus.CONFLICT, "Já existe um usuário com o e-mail " + usuario.getEmail());
        }
        usuario.setId(null);
        return repository.save(usuario);
    }
}
