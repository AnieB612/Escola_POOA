package com.exemplo.api.service;

import com.exemplo.api.model.Usuario;
import com.exemplo.api.repository.UsuarioRepository;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return repository.findAll().stream()
                .map(UsuarioResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public Usuario buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> NegocioException.naoEncontrado("Usuário " + id + " não encontrado"));
    }

    public UsuarioResponse criar(CriarUsuarioRequest dados) {
        if (repository.existsByEmail(dados.email())) {
            throw new NegocioException(HttpStatus.CONFLICT, "Já existe um usuário com o e-mail " + dados.email());
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dados.nome());
        usuario.setEmail(dados.email());
        usuario.setSenhaHash(passwordEncoder.encode(dados.senha()));
        usuario.setPerfil(dados.perfil());

        return UsuarioResponse.de(repository.save(usuario));
    }
}