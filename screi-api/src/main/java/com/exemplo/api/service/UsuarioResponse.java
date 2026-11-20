package com.exemplo.api.service;

import com.exemplo.api.model.Perfil;
import com.exemplo.api.model.Usuario;

public record UsuarioResponse(Long id, String nome, String email, Perfil perfil) {

    public static UsuarioResponse de(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil()
        );
    }
}