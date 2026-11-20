package com.exemplo.api.service;

import com.exemplo.api.model.Cadastro;
import java.util.List;

/**
 * Interface de exportação conforme o diagrama de classes UML (RF013).
 */
public interface Exportador {

    byte[] exportar(List<Cadastro> cadastros);
}
