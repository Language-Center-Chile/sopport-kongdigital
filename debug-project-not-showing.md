# Debug Session: project-not-showing
- **Status**: [OPEN]
- **Issue**: La app arranca pero no parece mostrar el proyecto esperado
- **Debug Server**: Pending
- **Log File**: .dbg/trae-debug-log-project-not-showing.ndjson

## Reproduction Steps
1. Iniciar el proyecto en desarrollo.
2. Abrir la app en el navegador.
3. Comparar lo que se muestra con lo esperado.

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | La app redirige a una ruta distinta y por eso no ves tu pantalla inicial | High | Low | Pending |
| B | El componente principal carga, pero los datos o el estado inicial dejan la vista vacia o diferente | High | Med | Pending |
| C | Hay un error de ejecucion en cliente que bloquea el render de tu contenido | Med | Med | Pending |
| D | El proyecto que estas esperando esta en otra ruta/pagina y no en la raiz | High | Low | Pending |
| E | El entorno local esta levantando una version distinta a la que esperabas | Med | Med | Pending |

## Log Evidence
Pending

## Verification Conclusion
Pending
