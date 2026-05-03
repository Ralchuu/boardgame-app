# Steam Finder – Oppimispäiväkirja

## Sovelluksen aihe ja tavoitteet

Mobiiliohjelmoinnin kurssin lopputyön sovellukseni nimi on **Steam Finder**

**Steam Finder** on Expo- ja React Native -sovellus, jolla käyttäjä voi hakea Steam-pelejä, tarkastella pelien tietoja, tallentaa pelejä suosikkeihin ja saada suosituksia uusista peleistä lisättyjen suosikkien perusteella.

Tavoitteena oli yhdistää useita mobiilipuolen osaamisen kannalta tärkeitä asioita: navigaatio, ulkoinen API, käyttäjäautentikointi, datan tallennus, useampi näkymä ja yhtenäinen sekä helppokäyttöinen käyttöliittymä.

Alussa projektin aihe oli vähän hakusessa. Mietin ensin vastaavaa sovellusta lautapeleistä, mutta en saanut BoardGameGeek API:in käyttöoikeuksia. Tämän takia vaihdoin aiheen Steamiin, koska Steam Store API on saatavilla ilman että lupaa täytyisi erikseen hakea. 

---

## Käytetyt teknologiat

Sovelluksessa käytin seuraavia teknologioita:

- Expo ja React Native 
- TypeScript
- Expo Router navigointiin
- Firebase Authentication 
- Firebase Realtime Database 
- Steam Store API 
- Custom hookeja 

Sovelluksessa on useita näkymiä: haku, pelilista, suosikit, suositukset, profiili, kirjautuminen, rekisteröinti ja pelin detail-näkymä. Näkymien välillä siirrytään Expo Routerin avulla.

---

## Navigaation toteutus

Käytin Expo Routeria ja tab-navigaatiota, koska se sopii hyvin sovellukseen, jossa on monta pääosiota. Sovelluksessa on erilliset välilehdet haulle, peleille, suosikeille, suosituksille ja profiilille.

Aluksi navigaatio ei ollut täysin yhtenäinen. Osa korteista näytti vain tietoa, osa mahdollisti suosikiksi lisäämisen ja osasta pääsi detail-näkymään. Myöhemmin yhtenäistin logiikan niin, että kortin painaminen vie aina pelin detail-sivulle.

Opin että jos sama elementti toimii eri näkymissä eri tavalla, sovellus tuntuu keskeneräiseltä.

---

## Steam API ja datan käsittely

Haku oli aluksi melko ongelmatonta toteuttaa, mutta huomasin pian että se ei kyllä toimi halutulla tavalla.

Esimerkiksi jos käyttäjä valitsi genren “RPG”, ensimmäinen toteutus haki pelejä hakusanalla `rpg`. Ongelma oli se että Steam palautti pelejä joiden nimessä luki “RPG”, vaikka ne eivät välttämättä olleet oikeasti RPG-genren pelejä. 

Korjasin tätä muuttamalla logiikkaa että pelit suodatetaan pelin omien genre-tietojen perusteella eikä pelkästään hakusanan mukaan. 

Opin että API:n dataa pitää validoida ja tuloksia voi joutua suodattaa itse

Opin myös deduplikoimaan tuloksia, aluksi samat pelit tulivat kokoajan vastaan haussa.

---

## Firebase ja autentikointi

Haasteita tuli näissä:

- Firebase-konfiguraation saaminen oikein
- ympäristömuuttujien käyttäminen
- kirjautumisen loading-tilat
- virheviestien näyttäminen käyttäjälle
- käyttäjän tilan päivittyminen kirjautumisen jälkeen

Opin että autentikointi ei tapahdu välittömästi samalla tavalla kuin tavallinen muuttujan asetus. Sovelluksen pitää kuunnella auth-tilan muutoksia ja reagoida niihin. Tähän käytin `onAuthStateChanged`-toimintoa.

Virheenkäsittelyssä opin että Firebase palauttaa teknisiä virhekoodeja joita käyttäjä ei ymmärrä. Muutin virheet selkeämmiksi viesteiksi, kuten “Invalid email or password” tai “Password must be at least 6 characters”.

---

## Suosikkien tallennus ja synkronointi

Suosikit tallennetaan Firebase Realtime Databaseen käyttäjäkohtaisesti. Tämä tarkoittaa, että jokaisella käyttäjällä on oma suosikkilista. Käytin tähän `useFavorites`-custom hookia, joka huolehtii suosikkien lukemisesta, lisäämisestä ja poistamisesta.

Tässä opin optimistisesta päivityksestä. Kun käyttäjä painaa “Add to favorites”, käyttöliittymä päivittää suosikin heti, eikä vasta sen jälkeen kun Firebase on vastannut. Jos tallennus epäonnistuu, muutos voidaan perua. Tämä tekee sovelluksesta nopeamman tuntuisen, mutta vaatii parempaa virheenkäsittelyä.

Opin myös, miksi transaktiot ovat hyödyllisiä. Firebaseen tallennettaessa käytin `runTransaction`-toimintoa, jotta suosikkien lisäys ja poisto eivät riko dataa, vaikka tila päivittyisi samaan aikaan.

---

## Custom hookit

Käytin näitä custom hookkeja:

- `useGames` pelien hakemiseen
- `useFavorites` suosikkien hallintaan
- `useAuth` kirjautumistilan käyttämiseen

Custom hookit olivat projektissa todella hyödyllisiä koska joitakin toimintoja tarvittiin monissa eri näkymissä.

Esim. suosikkeja tarvittiin hakunäkymässä, pelilistassa, detail-sivulla ja suosituksissa. Jos suosikkilogiikka olisi ollut jokaisessa näkymässä erikseen, koodi olisi mennyt sekavaksi. Hookin avulla pystyin pitämään näkymät enemmän käyttöliittymään keskittyvinä.

---

## Suosituslogiikka

Halusin, että sovellus ei vain näytä satunnaisia pelejä, vaan yrittää päätellä käyttäjän suosikeista, millaiset pelit voisivat kiinnostaa.

Toteutin logiikan joka huomioi:

- pelien genret
- kategoriat
- tagit, jos niitä on saatavilla
- kehittäjät
- Metacritic-pisteet
- liian samankaltaisten nimien välttämisen

Jos käyttäjän suosikeissa on yksi peli, ei ole kovin hyödyllistä näyttää vain saman sarjan lisäosia tai eri editioneita. Tämän takia lisäsin logiikkaa joka yrittää välttää liian lähellä olevia duplikaatteja.

Kukaan ei halua käyttää tälläistä sovellusta jossa suositukset ovat liian samanlaisia, kun koko sovelluksen idea on löytää uusia pelejä.

---

## Käyttöliittymän yhtenäistäminen

Ensin sovellus toimi, mutta näytti huonolta koska käyttöliittymä ei ollut yhtenäinen.

Sen takia tein yhteisen teeman, jossa on värit taustalle, korteille, tekstille, reunuksille ja virhetiloille.

Jos eri näkymät näyttää erilaiselta niin sovellus näyttää heikkolaatuiselta.

Opin että dark mode on helpompi toteuttaa, jos värit on alusta asti keskitetty. Jos värit ovat kovakoodattuina eri tiedostoissa, dark moden korjaaminen myöhemmin on paljon työläämpää.

---

## Mobiilinäkymän hienosäätö

Osa sisällöstä meni liian lähelle ylä- tai alareunaa. Tab bar, status bar ja laitteen omat navigointialueet vaikuttivat siihen, mihin sisältö asettuu.

Ratkaisin tätä käyttämällä `react-native-safe-area-context`-kirjastoa ja `useSafeAreaInsets`-hookia.

Dark modeen liittyvä valkoinen välähdys siirtymissä oli hyvä oppimiskokemus. Se ei johtunut yhdestä komponentista, vaan useasta eri tasosta: navigation theme, stackin tausta, tabien tausta ja natiivin ikkunan tausta. Tämä opetti, että mobiilisovelluksessa visuaalinen viimeistely voi vaatia usean kerroksen ymmärtämistä.

---

## Asiat joissa kehitin osaamista

Projektin aikana opin uutta näistä:

- Expo Routerin käyttöä tab- ja stack-navigaatiossa
- React Native -näkymien rakentamista usealla ruudulla
- Firebase Authenticationin ja Realtime Databasen käyttöä
- API-datan hakemista, muokkaamista ja suodattamista
- Custom hookkien tekemistä ja käyttämistä
- Light/dark mode -teeman rakentamista
- Safe area -ongelmien ratkaisemista
- Näppäimistön huomioimista lomakenäkymissä
- Käyttäjäystävällisempää virheenkäsittelyä

## Jos tekisin projektin uudelleen

Suunnittelisin käyttöliittymän ja komponenttirakenteen tarkemmin jo alussa. 

Tekisin enemmän uudelleenkäytettäviä komponentteja.

Kirjoittaisin ainakin joitain testejä apufunktioille ja hookeille.

Miettisin API-ratkaisua aikaisemmin.

---

## Pohdintaa

Vaikka aika kävi tiukille enkä ehtinyt toteuttaa kaikkea mitä halusin, niin sovellus on kuitenkin käytettävä ja toimiva kokonaisuus joten olen siihen melko tyytyväinen.

Kokonaisen käyttökelpoisen mobiilisovelluksen tekeminen oli hyvä oppikokemus. Hyvä sovellus syntyy siitä että kaikki ominaisuudet toimii yhdessä ja käyttöliittymä tuntuu yhtenäiseltä ja loogiselta. Suurimmat haasteet ei ollu yksittäisiä virheitä, vaan kokonaisuuden liittyviä asioita.

Projektin aikana huomasin, että kannattaa rakentaa ensin toimiva perusversio ja parantaa sitä vaiheittain.

Aluksi yritin välillä ratkaista liian monta asiaa kerralla, mikä teki virheiden selvittämisestä vaikeampaa. Kun aloin pilkkoa ongelmia pienempiin osiin, eteneminen helpottui. Tuli myös huomattua, että pienet yksityiskohdat vaikuttaa paljon siihen, että tuntuuko sovellus viimeistellyltä vai keskeneräiseltä.

