package com.estagio.demo.domain.user;

public enum UserRole {
    APROVADOR("aprovador"),
    SOLICITANTE("solicitante");

    private String role;

    UserRole(String role) {
        this.role = role;
    }

    public String getRole() {
        return role;
    }
}
