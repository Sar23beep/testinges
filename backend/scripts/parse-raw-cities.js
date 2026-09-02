const fs = require('fs');
const path = require('path');

const rawInput = `Thiruvananthapuram
Thoothukudi
Tiruchirappalli
Tirupati
Tumkur
Udaipur
Varanasi
Vadodara
Vijayawada
Visakhapatnam
Saket
Salem
Shimla
Shirdi
Siliguri
Sonipat
Surat
Thane
Panchkula
Patiala
Patna
Prayagraj
Puducherry
Pune
Puri
Raipur
Rajouri Garden
Rajahmundry
Rajkot
Ranchi
Rishikesh
Boya
Bundi
Butati
Bankli
Central Area
Chachaura
Chaksu
Chamboa Sarjela
Chandan
Chandelao
Chandrawati
Chauhtan
Chhabra
Chhata
Chhipa Barod
Chhoti Sadri
Chikalwas
Chirawa
Chittorgarh
Chomu
Dhariyawad
Dhaulpur
Dheerpura
Dholpur
Dhānd
Didwana
Digod
Doodni
Dudu
Dungargarh
Dungarpur
EKlingji
Elaka
Falna
Fatehabad
Fatehpur
Fazilka
Ferozpur Jhirka
Gajner
Gangapur
Gangaput
Gangdhar
Gangrar
Ganganagar
Garhi
Garot
Ghanerao
Ghatol
Goga Medi
Gogunda
Gosunda
Gudha Gorji
Gulabpura
Guman
Guna
Giigarh
Güdha
Hanumangarh
Hindaun
Hindoli
Hisar
Honkra
Jahazpur
Jaipur
Jaipur District
Jairampura
Jaisalmer
Jaisamand
Jaitaran
Jalor
Jamool Khera
Jamwa Ramgarh
Jawad
Jawai Bandh
Jayal
Jhalamand
Jhalarapatan
Jhalawar
Jhalod
Jharol
Jhunjhunu
Jirapur
Jodhpur
Jojawar
Jora
Juliasar
Kalakho
Kalinjara
Kalwad Kalan and Khurd
Kaman
Kanooja
Kapasan
Karanpur
Karauli
Karlai
Karnu
Kekri
Keshorai Patan
Ketu Barabas
Khairagarh
Khandar
Khandela
Khandi
Khanjipeer
Khanpur
Kharda
Khatoo
Khed Brahma
Khejarla
Kherli Kalan
Kherwara
Khetri
Khichan
Khilchipur
Khimsar
Khiyansaria
Khonda
Khuri
Kiraoli
Kishanganj
Kishanaarh
Kishangarh
Kishangarh Bas
Kivarli
Kolaras
Kolayat
Kolu
Kookas
Kota
Kotputli
Kotra
Kotri
Kuchaman
Kuldhar
Kumbhalgarh
Kumher
Kalwara
Kanota
Lachhmangarh
Lakhau
Lakawās
Lalsot
Lasadia
Loharu
Lunda
Luni
Lunkaransar
Mahamandir
Mahansar
Mahendragarh
Mahwah
Malhargarh
Malpura
Manasa
Mandai Charnan
Mandal
Mandalgarh
Mandawa
Mandawar
Mandore
Mandsaur
Mangalwad
Mangrol
Mathura
Meghraj
Mehandipur
Menal
Merta
Mogana
Mogra
Morena
Mount Abu
Mãvli
Nadbai
Naenwa
Nagar
Nagaur
Nakoda
Nandauti
Naorangdesar
Narlai
Narnaul
Nasirabad
Nathdwara
Nathrau
Nawa
Nawalgarh
Neem Ka Thana
Neemrana
Neemuch
Nimaaj
Nimbahera
Niwai
Nohar
Nokha
Nuh
Nai
Nimri
Ordi
Osian
Pachpadra
Pachpahar
Padampur
Pal
Pali
Pallu
Paota
Parsoli
Parvatsar
Peharsar
Perwa
Phagi
Phalodi
Phalsiya
Phulera
Pichiyak
Pilani
Pilibangan
Pindwara
Pipalda Kalan
Pirawa
Pohri
Pokhran
Poshina
Pratapgarh
Prempura
Punawali
Pushkar
Pakhar
Raghogarh
Raisinghnagar
Rajawas
Rajgarh
Rughnathpura
Rupbas
Rama
Rüpnagar
Sabalgarh
Sadri
Sadulshahr
Sagwara
Sailana
Saira
Sakrai
Salawas
Salumbar
Sam
Sambhar
Sanchor
Sangariya
Sangod
Sanjharia
Sarada
Sardar Samano
Sardarshahar
Sarwan
Sarwar
Sawai Madhopur
Sena
Seruna
Shahbad
Shahjahanpur
Shahpura
Shaitrawa
Shavri Colony
Shekhala
Sheopur
Shergarh
Shiv
Shivganj
Sindhari
Sirohi
Sitamau
Siwana
Siwani
Sodakore
Sodala
Sojat
Subhash Nagar
Sujangarh
Sumerpur
Sundhamata
Susner
Suratgarh
Talab
Taleti
Taoru
Tapukara
Thadiya
Thanagazi
Thandla
Tharad
Tibi
Tijara
Toda Bhim
Toda Raisingh
Todgarh
Tonk
Tonk Phatak
Tordi
Tirath
Udaipurwati
Uniara
Vallabhnagar
Vav
Vijayanagar
Viratnagar
Virpur
Aauwa
Abhaneri
Abohar
Abu Road
Achal Gadh
Achrol
Ahor
Air Force Area
Ajit Colony
Ajmer
Aklera
Alot
Alsisar
Alwar
Amar Sagar Pol
Ambah
Amer
Amet
Ani
Anjna
Anupgarh
Arnaud
Asind
Aspur
Atru
Bagar
Bagar Meo
Bagidora
Bagru
Bah
Balesar
Bali
Balotra
Bamanwas
Bamora
Banar
Bandikui
Banera
Bansur
Banswara
Bap
Baran
Rarar
Bari Sadri
Barmer
Baseri
Bassi
Baswa
Bawal
Bayana
Begun
Behror
Bera
Beawar
Bhachau
Bhadesar
Bhadra
Bhagat Ki Kothi
Bhangarh
Bhanpura
Bharatpur
Rajasthan
Bhehna
Bhiloda
Bhilwara
Bhim
Bhinai
Bhinmal
Bhiwadi
Bhopalgarh
Bhindar
Bijaipur
Bijapur
Bijaynagar
Bijolia
Bikaner
Bilara
Bilonchi
Bilonā
Binawas
Bisalpur
Bishangarh
Bonali
Film Nagar
Upparpally
Chevalla
Gandipet
Bhuvanagiri
Raikal
Patancheru-Shankarpalli Road
Manneguda
BN Reddy Nagar
Gudimalkapur
Domalauda
Hastinapuram
Keesara
Mehadipatnam
Sitaphalmandi
Nadergul
Bhoiguda
Gagillapur
Prashanth Nagar
Gunrock Enclave
New Mallepally
New Malakpet
Raj Bhavan Road
Chintalkunta
Surya Nagar Colony
Jalpally
Chowdhariguda
Moghalpura
Dullapally
Kakaguda
Riyasat Nagar
Jawahar Nagar
Lallaguda
Saifabad
Vattepally
Jam Bagh
Adarsh Nagar
Majarguda
Bairagiguda
Rasoolpura
Siddhartha Nagar
Kazipally
Ravulapalle Khurd
Seetharampally
Gundlapochampally
Erragadda
Thimmapur
Golkonda
Adikmet
Falaknuma
Katedan
Ramgopalpet
NH-7
Nagarjuna Sagar Road
Narsapur
Abdullapurmet
Neeladri Nagar
Pahadi Shareef
Karwan
Walker Town
Vayupuri
Narketpalli
Zahirabad
Pulimamidi
Dayara
Gulshan-e-lgbal Colony
Dhoolpet
Chintapallyguda
Dasarlapally
Edulanagulapalle
Moti Ganpur
Tulekhurd
Bogaram
Nampally
Kowkur
Isnapur
Lalapet
Sangareddy
Bandlaguda - Nagole
Mansoorabad
Maruti Nagar
Patighanpur
Santosh Nagar
Pet basheerabad
Chandrayanagutta
Moosarambagh
Suraram
Peerancheru
Ram Nagar
Muthangi
Budvel
NH-9 Highway
Bahadurpura
Humayun Nagar
Mylargada
Saleem Nagar
Kandukur
Almasguda
Narayanguda
Ramoji Film City
Champapet
Karkhana
Shamshabad Road
Rai Durg
Rajeev Nagar
Koti
Qutub Shahi Tombs
Sivarampalli
Pochampally
Venkatapuram
Outer Ring Road
R.K.Puram
Kalasiguda
Hakimpet
Lothkunta
Kanchan Bagh
Indresham
Konaara Kalan
Yakhutpura
Nawab Saheb Kunta
Lumbini Park
Osman Sagar Road
Sultanpur
Medak Road
Rendlagadda
Tupran
NTR Nagar
Jeera
Sindhi Colony
Afzal Gunj
Mirkhanpet
Kurmaguda
S D Road
Uppaguda
Pavanpuri Colony
Burgul
Mazidpur
Hanuman Nagar Colony
Sheriguda
Lal Darwaza
Ghansi Bazar
Venkat Reddy Colony
Shameerpet
Rani Gunj
Maisireddipalle
Gachibowli
Manikonda
Madinaguda
Nizampet
Bachupally
Gajularamaram
Puppalaguda
Ameerpet
Bandlaaude
Shamshabad
Srisailam Highway
Sainikpur
Bhanur
Himayath Nagar
Lingampally
Rajendra Nagar
Mehdipatnam
Bolaram
Nanakramguda
Kothaguda
Tarnaka
Kapre
Suchitra Road
Kondapur
Hi Tech City
Narsingi
Banjara Hills
Kompally
Hafeezpet
Shadnagar
Alwal
Tellapur
Dilsukhnaga
Yapral
Nagole
Dammaiguda
Vanasthalipuram
Nizampet Road
Financial District
Shamirpet
Chintal
Kothapet
Mallapur
Tukkuguda
Kismatpur
Kavadiguda
Osman Nagar
Old Bowenpally
Sanjeeva Reddy Nagar
Mallampet
Warangal highway
Saroor Naga
Shankarpalli
Sri Nagar Colony
Hyder Nagar
Malakpet
Bala Nagar
Mettuguda
Srinagar Colony
Langar Houz
Kavuri Hils
Medipalli
Quthbullapur
Badangpet
Ramchandra Puram
Cherlapally
Anandbagh
Velimela
Musheerabad
Gurram Guda
Karmanghat
East Marredpally
Bhongir
Shanthi Nagar
Masab Tank
Saidabad
Gandhi Naga
Turkayamjal
Jeedimetla
Balapur
Vijayawada Highway
Yousufguda
Ashram
Keshavpuran
Naraina
Sarai Rohilla
Wazirabad
Maharani Bagh
Rohini Sector 17
Vaishali
Delhi Cantonment
Raja Garden
Matiala
Civil Lines
Golf Links
Pushp Vihar
Kalindi Kunj
Budh Vihar
Ghazipur
Rohini Sector 23
Tri Nagar
Loknayakpuram
Greater Kailash III
Mithapur
Azadpur
Govindpuri Extension
Dera Mandi
Gulabi Bagh
Kashmiri Gate
Khan Market
Dwarka Sector 21
CR Park
Nehru Place
Pahar Ganj
Vivek Vihar
Yusuf Sarai
Lawrence Road
Ber Saral
Gandhi Nagar
Rohini Sector 1
Vijay Vihar
Barakhamba Road
Mundka
Roop Nagar
Ajmeri Gate
Khajoori Khas
Sukhdev Vihar
Balbir Nagar
Bharat Nagar
Vigyan Vihar
Siraspur
Chanakyapuri
Katwaria Saral
Rithala
Seemapuri
Akshar Dham
Sundar Nagar
Prem Nagar
Chawri Bazar
Sarojini Nagar
Razapur Khurd
Alipur
Madanpur Khadar
Tis Hazari
Pul Prahladpur
Inderpuri
Kanjhawala
Rohini Sector-36
Fatehpur Beri
Lal Kuan
Rohini Sector 19
Yojana Vihar
Bhagwan Das Road
Timarpur
Bakhtawarpur
Daryaganj
Sonia Vihar
Qutub Vihar
Nizamuddin
RK Puram
Dwarka Sector 16 B
Bakkar Wala
Satbari
Bhajanpura
Safdarjung Development Area
Jahangir Puri
Mandi House
Rohini Sector 20
Dashrath Puri
Mukundpur
Gujranwala Town
Rohini East
Karala
Kapashera
Bindapur
Ranjeet Nagar
Johripur
Shastri Park
Chokhandi
Green Park Extension
Trilokpuri
Siri Fort
Bawana
Jor Bagh
Pira Garhi
Rohini Sector 30
Rohini Sector 27
Jhilmil Colony
Nilothi
Rangpuri
Ranaji Enclave
Azad Nagar
Begumpur
Connaught Place
Gokalpur
Inderlok
Karawal Nagar
Manglapuri
Pragati Maidan
Rohini Sector 25
Sarai Kale Khan
Scami Nagar
Vrindavan
Wazirpur
Sidhartha Nagar
Hastsal
Sri Niwaspuri
Jaitpur
Deenpur
Sector 90
Khera Kalan
Kair
Shanti Niketan
Anand Parbat
Asian Games Village Complex
Badli
Bapa Nagar
AIIMS
Babarpur
Bhikaji Cama Place
Dhaula Kuan
Gol Market
Surajkund
Khureji
Mangolpuri
Rohini Extension
Rohini Sector 32
Sunder Nagari
Sultanpuri
Vikas Kunj
Brahmpuri
Dwarka Sector 20
Inder Enclave
Indraprastha Estate
Lakshmi Bai Nagar
Mayapuri
Rohini Sector 10
Sadar bazar
Savita Vihar
Sector 45
Chaman Vihar
Dwarka Sector 27
NH8, Gurgaon
Lodi Colony
Navjeevan Vihar
Rohini Sector 12
Sadiq Nagar
Meerut
Tilak Marg
Jharoda Majra Burari
Harsh Vihar
Dwarka Sector 16 A
Mustafabad
Moradabad
Seelampur
Batla house
Chhawla
Haibutpur
Malka Ganj
Tilangpur Kotla
Bhalswa
Kidwal Nagar
Adchini
Bahapur
Sector 9A
Sector 91
Rohini West
Sohna
Sector 150
Sector 49, Faridabad
Sunlight Colony
Kalu Sarai
Goyla Village
Dakshinpuri
Shakurpur
Rohini Sector-37
Daya Basti
Gopalpur Village
Singhu
Ranhola
Rohini Sector 38
Sawda
Zone P II
Village Mandoli
Neeti Bagh
Hauz Khas Enclave
Uday Park
Kaka Nagar
Central Delhi
East Delhi
North Delhi
North East Delhi
North West Delhi
South Delhi
West Delhi
South West Delhi
Ber Sarai
Agra
Ahmedabad
Ahmednagar
Aerocity
Alappuzha
Aligarh
Ambala
Amritsar
Andheri
Asansol
Danaalore
Chikkamagaluru
Coimbatore
Cuttack
Daman
Darjeeling
Dehradun
Delhi
Dharamshala
Erode
Faridabad
Gandhinagar
Ghaziabad
Goa
Jabalpur
Jalandhar
Jammu
Kanpur
Karol Bagh
Karnal
Kashipur
Kashmir
Kochi
Kolkata
Ladakh
Lakshadweep
Lucknow
Ludhiana
Madurai
Manali
Mangalore
Mira Road
Modinagar
Mohali
Mussoorie
Mysore
Nainital
Nagpur
Nashik
Navi Mumbai
Noida
Nizamabad
Ooty
Paharganj
Panipat`;

const lines = rawInput.split('\n').map(l => l.trim()).filter(Boolean);
console.log('Total input lines:', lines.length);

const unique = [];
const seen = new Set();
for (const line of lines) {
  const norm = line.toLowerCase();
  if (!seen.has(norm)) {
    seen.add(norm);
    unique.push(line);
  }
}
console.log('Unique lines:', unique.length);
fs.writeFileSync(path.join(__dirname, 'raw-cities.json'), JSON.stringify(unique, null, 2));
