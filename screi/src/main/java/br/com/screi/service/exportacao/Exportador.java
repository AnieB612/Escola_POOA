package br.com.screi.service.exportacao;

import java.util.List;

import br.com.screi.model.Cadastro;


public interface Exportador {

    byte[] exportar(List<Cadastro> cadastros);
}
