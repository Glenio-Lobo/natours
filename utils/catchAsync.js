/*
 * Explicação:
 * Função que serve para eliminar o try catch das async function, retorna um função
 * que executa o método assíncrono passado para ela.
 * Caso esse método contenha um erro, esse erro é captado e passado para a função next() que encaminha
 * para a função de erro global responsável.
 * 
 */
 
export function catchAsync( asyncFunction ){
    return (request, response, next) => {
        asyncFunction(request, response, next).catch(next);
    };
}