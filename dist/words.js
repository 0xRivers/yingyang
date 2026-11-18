// Every row keeps the two sides of a pair together in English, Polish and Portuguese.
export const pairs = [
['Day|Night','Dzień|Noc','Dia|Noite'],
['Hot|Cold','Gorący|Zimny','Quente|Frio'],
['Big|Small','Duży|Mały','Grande|Pequeno'],
['Happy|Sad','Wesoły|Smutny','Feliz|Triste'],
['Up|Down','W górę|W dół','Para cima|Para baixo'],
['Open|Closed','Otwarty|Zamknięty','Aberto|Fechado'],
['Fast|Slow','Szybki|Powolny','Rápido|Lento'],
['Wet|Dry','Mokry|Suchy','Molhado|Seco'],
['Full|Empty','Pełny|Pusty','Cheio|Vazio'],
['Loud|Quiet','Głośny|Cichy','Barulhento|Silencioso'],
['Start|Finish','Początek|Koniec','Início|Fim'],
['Near|Far','Blisko|Daleko','Perto|Longe'],
['Heavy|Light','Ciężki|Lekki','Pesado|Leve'],
['Asleep|Awake','Śpiący|Obudzony','Adormecido|Acordado'],
['Clean|Dirty','Czysty|Brudny','Limpo|Sujo'],
['Above|Below','Nad|Pod','Acima|Abaixo'],
['Calm|Anxious','Spokojny|Niespokojny','Calmo|Ansioso'],
['Soft|Hard','Miękki|Twardy','Macio|Duro'],
['Long|Short','Długi|Krótki','Comprido|Curto'],
['Inside|Outside','W środku|Na zewnątrz','Dentro|Fora'],
['Hello|Goodbye','Cześć|Do widzenia','Olá|Adeus']
].map(row=>row.map(pair=>pair.split('|')))

export const copy={
en:['Play','Collection','Parents','Opposites Garden','Discover opposite words and collect all 21 Ying Yangs.','Question','of','Word pairs','What is the opposite of','Tap a speaker to hear a word.','My collection','Earn a Ying Yang for every opposite pair.','View collection','Listen & learn','Hear each word in the language you choose.','Read aloud','Try another word.','A perfect pair!','Next pair','See my collection','All 21 pairs complete!','Play again','Your collection','Your opposite pairs, one Ying Yang at a time.','To discover','Parent area','Set a parent PIN','Choose a PIN with 4 to 8 digits for this browser.','Enter your parent PIN.','PIN','Confirm PIN','Save PIN','Unlock','The PINs must match.','Incorrect PIN. Try again.','Playing as a guest','Nostr profile','Sign in with Nostr','Sign out','Reset this collection','Clear all 21 spaces for this profile?','Clear progress','Cancel','A Nostr browser signer is needed to sign in.','Sign-in could not be verified.','Word audio is unavailable. Check your device’s speech voices.','Close','Listen','Progress is saved on this browser.','Well done!','Back to play','Sun','Rain','Language'],
pl:['Graj','Kolekcja','Rodzice','Ogród przeciwieństw','Odkrywaj przeciwieństwa i zbierz wszystkie 21 symboli Ying Yang.','Pytanie','z','Pary słów','Jakie jest przeciwieństwo słowa','Dotknij głośnika, aby usłyszeć słowo.','Moja kolekcja','Zdobądź symbol Ying Yang za każdą parę.','Zobacz kolekcję','Słuchaj i ucz się','Posłuchaj każdego słowa w wybranym języku.','Czytaj na głos','Spróbuj innego słowa.','Świetna para!','Następna para','Zobacz moją kolekcję','Wszystkie 21 par zebrane!','Zagraj ponownie','Twoja kolekcja','Każda para to kolejny symbol Ying Yang.','Do odkrycia','Strefa rodzica','Ustaw PIN rodzica','Wybierz PIN od 4 do 8 cyfr dla tej przeglądarki.','Wpisz PIN rodzica.','PIN','Powtórz PIN','Zapisz PIN','Odblokuj','Kody PIN muszą być takie same.','Niepoprawny PIN. Spróbuj ponownie.','Gra jako gość','Profil Nostr','Zaloguj przez Nostr','Wyloguj','Wyczyść tę kolekcję','Wyczyścić wszystkie pola tego profilu?','Wyczyść postęp','Anuluj','Do logowania potrzebne jest rozszerzenie Nostr.','Nie udało się potwierdzić logowania.','Brak głosu. Sprawdź ustawienia mowy na urządzeniu.','Zamknij','Posłuchaj','Postęp zapisuje się w tej przeglądarce.','Brawo!','Wróć do gry','Słońce','Deszcz','Język'],
pt:['Jogar','Coleção','Pais','Jardim dos Opostos','Descobre palavras opostas e coleciona os 21 Ying Yangs.','Pergunta','de','Pares de palavras','Qual é o oposto de','Toca num altifalante para ouvir a palavra.','A minha coleção','Ganha um Ying Yang por cada par de opostos.','Ver coleção','Ouve e aprende','Ouve cada palavra na língua que escolheres.','Ler em voz alta','Experimenta outra palavra.','Um par perfeito!','Próximo par','Ver a minha coleção','Completaste os 21 pares!','Jogar de novo','A tua coleção','Um Ying Yang por cada par de opostos.','Por descobrir','Área dos pais','Criar PIN parental','Escolhe um PIN de 4 a 8 dígitos para este navegador.','Introduz o PIN parental.','PIN','Confirmar PIN','Guardar PIN','Desbloquear','Os PINs têm de coincidir.','PIN incorreto. Tenta novamente.','A jogar como visitante','Perfil Nostr','Entrar com Nostr','Sair','Repor esta coleção','Limpar os 21 espaços deste perfil?','Apagar progresso','Cancelar','É necessário um assinador Nostr no navegador.','Não foi possível confirmar o início de sessão.','Áudio indisponível. Verifica as vozes do dispositivo.','Fechar','Ouvir','O progresso é guardado neste navegador.','Muito bem!','Voltar ao jogo','Sol','Chuva','Língua']
}
