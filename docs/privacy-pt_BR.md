# Política de privacidade do IP Flag

Data de vigência: 11 de agosto de 2026.

[English](privacy.html) · [Русский](privacy-ru.html)

IP Flag é uma extensão de navegador que mostra localmente como o navegador aparece na Internet: endereços IPv4/IPv6 públicos, país de saída e organização de rede.

## Dados processados

A extensão contata serviços externos para determinar os endereços IPv4 e IPv6 públicos do navegador. Em seguida, envia esses endereços a um serviço GeoIP para determinar o país e a organização de rede.

A versão atual usa `api.ipify.org` para IPv4 público, `api6.ipify.org` para IPv6 público e `api.ipapi.is` para país, ASN e organização de rede.

## Dados não coletados

O IP Flag não solicita nem acessa histórico de navegação, URLs visitadas, conteúdo de páginas, cookies, pesquisas, senhas, dados de conta ou localização precisa do dispositivo.

A extensão não usa análises, publicidade, telemetria, sincronização na nuvem ou um backend operado pelo desenvolvedor.

## Armazenamento local e transferência

O estado de rede atual, o estilo de bandeira selecionado e um pequeno cache GeoIP ficam somente no armazenamento local da extensão. O cache é mantido por até 24 horas e contém no máximo 50 endereços IP.

Um endereço IP público é enviado aos serviços indicados somente para a função principal da extensão, por HTTPS.

## Alterações nesta política

Esta página será atualizada com uma nova versão da extensão se o tratamento de dados mudar de forma relevante.
