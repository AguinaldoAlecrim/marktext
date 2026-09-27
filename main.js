javascript: (function () {
    // Nomes de variáveis mais específicos para evitar colisões
    var FLAG_NAME = "__marcadorDeTextoAtivo";
    var HANDLER_NAME = "__marcadorDeTextoHandler";
    var CLASSE_DESTAQUE = "bookmarklet-text-highlight";

    // Função de notificação visual (Toast)
    var mostrarMensagem = function (mensagem, sucesso) {
        // Remove toasts anteriores para evitar sobreposição
        var toastsAnteriores = document.querySelectorAll(".bookmarklet-toast");
        toastsAnteriores.forEach(function (t) {
            t.remove();
        });

        var toast = document.createElement("div");
        toast.className = "bookmarklet-toast";
        toast.textContent = mensagem;

        Object.assign(toast.style, {
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: "2147483647",
            padding: "12px 18px",
            borderRadius: "6px",
            backgroundColor: sucesso ? "#198754" : "#dc3545",
            color: "#fff",
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
            fontWeight: "bold",
            boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
            pointerEvents: "none",
            transition: "opacity 0.3s ease-in-out",
            opacity: "1",
        });

        document.body.appendChild(toast);

        setTimeout(function () {
            toast.style.opacity = "0";
            setTimeout(function () {
                toast.remove();
            }, 300);
        }, 2500);
    };

    
    // Função que executa o destaque do texto
    var destacarTexto = function () {
        var selecao = window.getSelection();
        var textoSelecionado = selecao.toString().trim();

        if (textoSelecionado.length === 0) return;

        try {
            var range = selecao.getRangeAt(0);
            var span = document.createElement("span");

            // Estilos do marcador
            Object.assign(span.style, {
                backgroundColor: "yellow",
                cursor: "pointer",
                transition: "background-color 0.2s",
                color: "#000000",
            });
            span.className = CLASSE_DESTAQUE;

            // Tenta envolver o conteúdo preservando a estrutura original
            // surroundContents falha se o range atravessar múltiplos nós
            try {
                range.surroundContents(span);
            } catch (erro) {
                // Fallback: extrai o conteúdo e insere no span
                span.appendChild(range.extractContents());
                range.insertNode(span);
            }

            // Adiciona interatividade: clique para remover o destaque
            span.addEventListener("click", function (ev) {
                ev.stopPropagation();
                var parent = span.parentNode;

                // Move os filhos de volta para o pai (restaura a estrutura)
                while (span.firstChild) {
                    parent.insertBefore(span.firstChild, span);
                }

                parent.removeChild(span);
                parent.normalize(); // Junta nós de texto adjacentes

                mostrarMensagem("Destaque removido.", true);
            });

            // Limpa a seleção após o destaque
            selecao.removeAllRanges();
        } catch (erro) {
            console.error("Erro ao destacar o texto:", erro);
            mostrarMensagem(
                "Não foi possível destacar o texto selecionado.",
                false,
            );
        }
    };

    // Lógica de alternância (toggle)
    if (window[FLAG_NAME]) {
        // DESATIVAR
        document.removeEventListener("mouseup", window[HANDLER_NAME]);
        delete window[FLAG_NAME];
        delete window[HANDLER_NAME];
        mostrarMensagem("Marcador de texto desativado.", false);
    } else {
        // ATIVAR
        window[HANDLER_NAME] = destacarTexto;
        document.addEventListener("mouseup", window[HANDLER_NAME]);
        window[FLAG_NAME] = true;
        mostrarMensagem(
            "Marcador de texto ativado. Selecione o texto para destacar.",
            true,
        );
    }
})();
