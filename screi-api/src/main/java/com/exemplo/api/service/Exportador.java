package com.exemplo.api.service;

import com.exemplo.api.model.Cadastro;
import java.util.List;

public interface Exportador {

    String formato();

    byte[] exportar(List<Cadastro> cadastros);
}