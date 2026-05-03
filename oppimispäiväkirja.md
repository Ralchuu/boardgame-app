# Oppimispäiväkirja

## Sovelluksen aihe ja kuvaus

Työn aiheena on **Steam Finder**, Expo- ja React Native -sovellus, jonka avulla käyttäjä voi hakea Steam-pelejä, selata pelien tietoja ja tallentaa suosikkeja. Sovelluksen ideana oli tehdä selkeä ja käytännöllinen mobiilisovellus, jossa on hakutoiminto, suosikkien hallinta, suositukset ja käyttäjäsisältöä tukeva profiilisivu.

### Käytetyt teknologiat ja kirjastot

- **Expo** ja **React Native** mobiilisovelluksen runkona
- **TypeScript** sovelluksen toteutuskielenä
- **Expo Router** näkymien ja navigaation hallintaan
- **Firebase Authentication** käyttäjien kirjautumiseen ja rekisteröitymiseen
- **Firebase Realtime Database** suosikkien tallentamiseen
- **Steam Store API** pelien hakemiseen ja pelitietojen näyttämiseen
- **AsyncStorage** käyttäjätunnuksen säilyttämiseen paikallisesti
- **react-native-safe-area-context** järjestelmäalueiden huomioimiseen
- **expo-haptics** ja muut Expo-kirjastot käyttökokemuksen parantamiseen

## Toteutuksen vaiheet

### 1. Aiheen valinta ja suunnittelu

Aluksi valittiin sovelluksen aihe niin, että se sopii mobiiliohjelmoinnin kurssin tavoitteisiin. Halusin tehdä sovelluksen, jossa on haku, lista, tallennus ja kirjautuminen, koska ne harjoittavat useita kurssilla opittuja osa-alueita.

Palautteen perusteella tavoitteeksi asetettiin tehdä sovelluksesta visuaalisesti siisti ja helposti esiteltävä, ei pelkkä tekninen demo.

### 2. Perustoiminnallisuuksien rakentaminen

Ensimmäisessä vaiheessa toteutin kirjautumisen, rekisteröitymisen, hakunäkymän, suosikit ja suositukset. Tämän jälkeen sovellukseen tuli toimiva rakenne, jossa käyttäjä voi etsiä pelejä, lisätä niitä suosikkeihin ja saada niiden perusteella suosituksia.

### 3. Käyttöliittymän yhtenäistäminen

Seuraavassa vaiheessa paransin sovelluksen ulkoasua, koska alussa eri näkymät näyttivät hieman erilaisilta ja osa sisällöstä käytti kovakoodattuja värejä. Ratkaisin tämän tekemällä yhteiset väriteemat ja pintavärit, joita käytettiin kaikissa näkymissä.

Tämä teki sovelluksesta selkeämmän ja ammattimaisemman näköisen.

### 4. Safe area -ongelmien korjaaminen

Android-laitteella osa sisällöstä meni järjestelmäalueiden, kuten kellon ja navigointipalkin, päälle. Tämä näkyi erityisesti tabien alareunassa ja hakusivun otsikossa.

Ratkaisuna lisäsin safe area -tuen tab-layoutiin ja yksittäisiin näkymiin. Sen jälkeen sisältö alkoi oikeasta kohdasta eikä mennyt puhelimen järjestelmäelementtien päälle.

### 5. Hakusivun visuaalinen viimeistely

Hakusivu tuntui aluksi hieman tyhjältä, joten lisäsin siihen teemaan sopivan hero-osion, pienen logo-/ikoni-elementin ja taustamuotoja. Tämä teki sivusta elävämmän ilman että se muuttui liian raskaaksi.

Samalla tulin siihen johtopäätökseen, että sovellukselle kannattaa tehdä oma logo. Yksinkertainen ja tunnistettava logo tukee koko sovelluksen ulkoasua ja auttaa myös app iconin ja splash screenin suunnittelussa.

### 6. Salasanakenttien validaatiot ja KeyboardAvoidView

  - Korjattiin salasanakenttien piilotus-ongelma Androidilla käyttämällä bullet-overlay -tekniikkaa, jotta yksittäinen kirjain ei vilahtaisi näkyviin kirjoitettaessa.
  - Lisättiin `Show`/`Hide`-toiminnot salasanakenttiin sekä remontoitiin kenttien renderöinti niin, että piilotus on luotettavampi eri laitteilla.
  - Tehtiin login- ja register-näkymistä keyboard-safe lisäämällä `KeyboardAvoidingView` + `ScrollView`, jolloin näppäimistö ei peitä kenttiä pienemmillä näytöillä.
 

## Kohdatut ongelmat ja ratkaisut

### Ongelma 1: Steam API ja web-käyttö

Steam-haku ei toiminut kaikissa ympäristöissä suoraan selaimessa CORS-rajoitusten takia.

**Ratkaisu:** Sovellukseen lisättiin paikallinen Steam-proxy-palvelin kehitystä varten. Sen avulla haku toimii luotettavammin webissä ja kehityksessä.

### Ongelma 2: Firebase-asetukset ja kirjautuminen

Firebaseen liittyvässä toteutuksessa tuli vastaan alkuvaiheessa useita asetuksiin liittyviä ongelmia. Kirjautuminen ja rekisteröityminen eivät toimineet heti odotetusti, koska Firebase-projekti, Authentication-asetukset ja Realtime Database -yhteys piti saada oikein kuntoon. Myös ympäristömuuttujien ja palvelun alustuksen kanssa piti olla tarkkana, jotta sovellus ei yrittänyt käyttää puuttuvia asetuksia.

**Ratkaisu:** Tarkistin Firebase-projektin asetukset, varmistin Authenticationin käyttöönoton ja testasin, että tietokantaan tallennus ja lukeminen toimivat oikein. Lisäksi tallensin käyttäjän tunnuksen paikallisesti AsyncStoragen avulla, jotta sovellus pystyy pitämään käyttäjän tilan hallinnassa uudelleenkäynnistyksen jälkeen.

### Ongelma 3: Yhtenäisen tyylin puute

Alussa eri näkymissä oli paljon kovakoodattuja värejä ja eri kokoisia kortteja, mikä sai sovelluksen näyttämään hajanaiselta.

**Ratkaisu:** Määrittelin yhteiset väri- ja pintatokenit ja käytin niitä kaikissa näkymissä. Tämän jälkeen käyttöliittymästä tuli yhtenäinen.

### Ongelma 4: Sisältö meni järjestelmäalueiden päälle

Androidilla tabien ikonit ja hakusivun otsikko olivat liian lähellä puhelimen ylä- ja alareunoja.

**Ratkaisu:** Käytin safe area -sisennyksiä sekä tabien layoutissa että näkymien sisällössä. Tämä korjasi sijoittelun ja teki sovelluksesta siistimmän käyttää.

### Ongelma 5: Hakusivu näytti tyhjältä

Hakusivun ensimmäinen versio oli toimiva mutta visuaalisesti vähän orpo.

**Ratkaisu:** Lisäsin etusivulle esittelyosion, ikonin ja taustamuotoja sekä harkitsin sovellukselle omaa logoa. Näin hakusivusta tuli selkeämpi ja paremmin viimeistelty.

### Ongelma 6: Salasanan vilahtelu kirjoitettaessa

**Kuvaus:** Android-laitteilla salasanakenttä saattoi hetkellisesti näyttää juuri kirjoitetun kirjaimen, vaikka kenttä oli asetettu piilotetuksi.

**Ratkaisu:** Piilotetaan syöte asettamalla tekstin väri `transparent` ja piirretään päälle bullet-merkit (`'•'`) `Text`-komponentilla. Lisättiin myös `Show`/`Hide`-nappi turvalliseen paljastukseen.

### Ongelma 7: Näppäimistö peitti rekisteröintinäkymän

**Kuvaus:** Pienillä näytöillä mobiilin näppäimistö peitti rekisteröintilomakkeen toisen salasanakentän.

**Ratkaisu:** Käytettiin `KeyboardAvoidingView` + `ScrollView`-rakennetta ja asetettiin `keyboardShouldPersistTaps="handled"`, jotta lomake pysyy saavutettavana ja käyttäjä voi skrollata kenttien yli.

## Yhteenveto

### 6. Pelin yksityisnäkymä ja navigoinnin yhtenäistäminen

Toteutin sovellukseen pelin yksityisnäkymän, johon siirrytään pelikortista. Yksityisnäkymässä näytetään pelin tärkeät tiedot (nimi, kuva, julkaisu, hinta, genret, kehittäjä/julkaisija, kuvaus) sekä suosikkinappi.

Lisäksi yhtenäistin käyttäjävirran niin, että pelikortin painallus avaa detaljisivun samalla tavalla kaikissa päävälilehdissä (haku, pelit, suosikit ja suositukset). Tavoite oli poistaa epäjohdonmukaisuus, jossa osa korteista teki eri asian kuin toiset.

Myös takaisin-painike viimeisteltiin teeman mukaiseksi, jotta sivu näyttää samalta kuin muu sovellus.

### 7. Siirtymien ja dark moden viimeistely

Yksi isoin käytettävyysongelma oli valkoinen välähdys siirtymissä, erityisesti detail-sivulta takaisin päin. Korjasin tämän sovittamalla stackin taustat, tab-skenen taustat, status barin tyylin sekä natiivin ikkunataustan samaan teemaan.

Tämän jälkeen navigointi tuntui paljon tasaisemmalta eikä dark moden keskelle tullut enää valkoisia välähdyksiä.

### 8. TypeScript-ympäristön siivous

Lopussa vastaan tuli tilanne, jossa editori näytti virheitä `node_modules`-kansion Expo-pakettien tsconfigeista. Ne eivät olleet varsinaisia sovelluksen koodivirheitä, mutta häiritsivät kehitystä.

Ratkaisin tämän käyttämällä workspace-kohtaista TypeScript-versiota ja rajaamalla `node_modules`- sekä `.expo`-kansiot tyypitysskoopin ulkopuolelle.

## Mitä opin tämän projektin aikana

- Expo Routerin kanssa kannattaa joskus valita yksinkertaisempi reititysratkaisu, jos se tekee navigoinnista varmemman.
- Sisäkkäisissä painikkeissa `stopPropagation` on tärkeä, jotta kortin painallus ja napin painallus eivät laukea yhtä aikaa.
- Mobiilissa käyttöliittymän viimeistely on paljon muutakin kuin komponentit: myös status bar, safe area, scene-taustat ja transition-animaatiot vaikuttavat lopputulokseen.
- Kaikki TypeScript-virheet eivät ole oman koodin virheitä, vaan joskus kyse on editorin konfiguraatiosta.

## Lopullinen yhteenveto

Projektin aikana sovellus kehittyi perustoimivasta versiosta huomattavasti valmiimmaksi kokonaisuudeksi. Isoimmat parannukset tulivat käyttöliittymän yhtenäistämisestä, navigoinnin selkeyttämisestä ja siitä, että ongelmia korjattiin käytännön testauksen perusteella laiteympäristössä.

Oma fiilis lopputuloksesta on hyvä: sovellus on nyt teknisesti vakaampi, visuaalisesti yhtenäisempi ja käyttäjän näkökulmasta loogisempi käyttää. Samalla opin paljon siitä, miten pienetkin mobiili-UI:n yksityiskohdat vaikuttavat siihen, näyttääkö sovellus keskeneräiseltä vai viimeistellyltä.
