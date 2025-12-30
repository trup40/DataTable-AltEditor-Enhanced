> [🇺🇸 Read in English](./README.md)

# DataTable-AltEditor (Geliştirilmiş Sürüm)

**AltEditor**, DataTables için geliştirilmiş, modal tabanlı hafif bir CRUD (Ekle, Oku, Güncelle, Sil) eklentisidir.

Bu **v3.0 Geliştirilmiş** sürüm ([Eagle](https://github.com/trup40) tarafından düzenlenmiştir), orijinal kütüphaneyi gelişmiş yaşam döngüsü kancaları (hooks), native Base64 dosya işleme, satır içi (inline) form düzenleri, daha temiz global kontrol bayrakları ve akıllı seçim kutusu (select box) yönetimi ile önemli ölçüde genişletmektedir.

## 🚀 Temel Özellikler

* **Modal Tabanlı Düzenleme:** Tablonuza "Ekle", "Düzenle" ve "Sil" butonları ekler.
* **Kapsamlı Yaşam Döngüsü Kancaları:** Modallar açılmadan önce/sonra ve veriler gönderilmeden önce/sonra araya girmenizi sağlar.
* **Satır İçi Form Düzeni:** `inline: true` seçeneğini kullanarak birden fazla giriş alanını aynı satırda yan yana gösterin.
* **Base64 Dosya Desteği:** Dosya yüklemelerini sunucuya göndermeden önce otomatik olarak Base64 formatına çevirir (`encodeFiles: true`).
* **Akıllı Seçim Kutuları:** `select2` desteği, otomatik sıralama ve değer/metin seçim modları (`selectwanted`).
* **Global Kontrol Objesi:** `altEditorFlags` nesnesi aracılığıyla modalların açılmasını veya formların gönderilmesini programatik olarak engelleyin.
* **Entegrasyonlar:** Bootstrap 3/4/5, Foundation, Select2, Bootstrap-Datepicker ve jQuery UI Datepicker destekler.

## 📦 Gereksinimler

Projenizde aşağıdaki kütüphanelerin yüklü olduğundan emin olun:

* jQuery
* DataTables (Buttons eklentisi ile birlikte)
* Bootstrap (JS/CSS) veya Foundation
* *Opsiyonel:* Select2, Moment.js, Bootstrap-Datepicker

## ⚙️ Kurulum & Konfigürasyon

DataTables başlatma ayarlarınıza `altEditor: true` (veya bir konfigürasyon objesi) ekleyerek AltEditor'ü etkinleştirin.

### 1. Global Ayarlar

Bu ayarlar, DataTables tanımı içinde editörün genel davranışını kontrol eder.

| Seçenek | Tip | Varsayılan | Açıklama |
| :--- | :--- | :--- | :--- |
| `altEditor` | `boolean` | `false` | AltEditor eklentisini etkinleştirir. |
| `encodeFiles` | `boolean` | `false` | **[Yeni]** `true` ise, dosya girişleri gönderilmeden önce otomatik olarak Base64 string'e çevrilir. |
| `closeModalOnSuccess` | `boolean` | `true` | `true` ise, başarılı bir AJAX yanıtından sonra modal otomatik olarak kapanır. |
| `altEditorDelButtons` | `array` | `[]` | Kaldırılacak veya gizlenecek varsayılan buton isimleri listesi (örneğin özel butonlar kullanmak isterseniz). |

### 2. Kolon Konfigürasyonu (`columns`)

Modal içindeki giriş alanları için yapılan ayarlar, standart DataTables `columns` dizisi içinde tanımlanır.

| Parametre | Tip | Açıklama |
| :--- | :--- | :--- |
| `data` (veya `name`) | `string` | Satır nesnesindeki veri kaynağı anahtarı. |
| `title` | `string` | Giriş alanı için etiket metni. Varsayılan olarak tablo başlığını alır. |
| `type` | `string` | Giriş tipi: `text`, `select`, `hidden`, `textarea`, `file`, `checkbox`, `number`, `readonly`, `date`. |
| `inline` | `boolean` | **[Yeni]** `true` ise, bu alan bir sonraki alanla aynı satırda (yan yana) yerleştirilir. |
| `selectwanted` | `string` | **[Yeni]** `select` tipleri için. `'id'` değeri gönderir; `'text'` görünen metni gönderir. |
| `optionsSortByLabel` | `boolean` | **[Yeni]** `select` tipleri için. `true` ise seçenekler etikete göre alfabetik sıralanır. |
| `bootstrapdatepicker` | `object` | **[Yeni]** `bootstrap-datepicker` için konfigürasyon objesi. |
| `options` | `array` | `select` verisi. Formatlar: `['A','B']` veya `[{id:1, text:'A'}]` veya `[{id:null, text:'Grup', children:[...]}]`. |
| `select2` | `object` | Select2 konfigürasyon objesi (ör. `{ width: '100%' }`). |
| `datepicker` | `object` | jQuery UI Datepicker konfigürasyonu. |
| `datetimepicker` | `object` | Datetimepicker konfigürasyonu. |
| `required` | `boolean` | `required` (zorunlu) özelliğini ekler. |
| `readonly` | `boolean` | `readonly` (salt okunur) özelliğini ekler. |
| `disabled` | `boolean` | `disabled` (devre dışı) özelliğini ekler. |
| `placeholder` | `string` | Placeholder (yer tutucu) metni. |
| `unique` | `boolean` | Değerin tabloda zaten var olup olmadığını kontrol eden istemci taraflı doğrulama. |
| `rows` | `number` | `textarea` için yükseklik (satır sayısı). Varsayılan: 5. |
| `cols` | `number` | `textarea` için genişlik (kolon sayısı). Varsayılan: 30. |
| `min` | `number` | `number` girişleri için minimum değer. |
| `max` | `number` | `number` girişleri için maksimum değer. |
| `step` | `number` | `number` girişleri için artış adımı. |
| `maxsize` | `number` | `file` girişleri için maksimum dosya boyutu. |
| `accept` | `number` | `file` girişleri için kabul edilen dosya tipleri. |
| `maxLength` | `number` | Girişler için maksimum karakter uzunluğu. |
| `pattern` | `string` | Doğrulama için Regex deseni. Varsayılan: `.*` |
| `style` | `string` | Giriş elemanı için satır içi CSS stilleri. |
| `hoverMsg` | `string` | Üzerine gelindiğinde çıkan ipucu metni. |
| `msg` | `string` | Hata mesajı metni (eski sürüm). |
| `uniqueMsg` | `string` | Benzersizlik ihlali hata mesajı (eski sürüm). |
| `special` | `string` | Dahili kullanım bayrağı. |
| `editorOnChange` | `function` | Giriş değiştiğinde tetiklenen özel geri çağırma fonksiyonu: `function(event, altEditorInstance)`. |

### 3. Yaşam Döngüsü Kancaları (Events)

Sürecin çeşitli aşamalarına müdahale edebilirsiniz. Bu fonksiyonları DataTables konfigürasyonunuzda tanımlayın.

#### Modal Açılış Kancaları

| Kanca (Hook) | Açıklama |
| :--- | :--- |
| `onBeforeAddRow(dt, row, success, error)` | Ekleme Modalı açılmadan **önce** tetiklenir. |
| `onBeforeEditRow(dt, row, success, error)` | Düzenleme Modalı açılmadan **önce** tetiklenir. |
| `onBeforeDeleteRow(dt, row, success, error)` | Silme Modalı açılmadan **önce** tetiklenir. |
| `onAfterAddRow(dt, row, success, error)` | Ekleme Modalı gösterildikten **sonra** (DOM hazır olduğunda) tetiklenir. |
| `onAfterEditRow(dt, row, success, error)` | Düzenleme Modalı gösterildikten **sonra** tetiklenir. |
| `onAfterDeleteRow(dt, row, success, error)` | Silme Modalı gösterildikten **sonra** tetiklenir. |

#### Gönderim Kancaları (Validasyon)

Verileri sunucuya göndermeden önce istemci tarafı doğrulama yapmak için idealdir.

| Kanca (Hook) | Açıklama |
| :--- | :--- |
| `onBeforeAddSubmitRow(dt, row, success, error)` | "Ekle" butonuna basıldığında, sunucu isteğinden **önce** tetiklenir. |
| `onBeforeEditSubmitRow(dt, row, success, error)` | "Düzenle" butonuna basıldığında, sunucu isteğinden **önce** tetiklenir. |
| `onBeforeDeleteSubmitRow(dt, row, success, error)` | "Sil" butonuna basıldığında, sunucu isteğinden **önce** tetiklenir. |

#### Sunucu İşlem Callback'leri

Gerçek AJAX isteklerini burada yönetin.

| Callback | Açıklama |
| :--- | :--- |
| `onAddRow(dt, rowdata, success, error)` | Kayıt **oluşturmak** için API çağrısını yapın. |
| `onEditRow(dt, rowdata, success, error)` | Kayıt **güncellemek** için API çağrısını yapın. |
| `onDeleteRow(dt, rowdata, success, error)` | Kayıt **silmek** için API çağrısını yapın. |

### 4. Global Kontrol Bayrakları (Flags)

`altEditorFlags` global nesnesini kullanarak editör davranışını programatik olarak kontrol edebilirsiniz. Bu, dış durumlara bağlı olarak bir modalın açılmasını engellemek gibi koşullu mantıklar için kullanışlıdır.

| Özellik | Varsayılan | Açıklama |
| :--- | :--- | :--- |
| `altEditorFlags.preventAddModal` | `false` | `true` ise, **Ekleme Modalının** açılmasını engeller. |
| `altEditorFlags.preventEditModal` | `false` | `true` ise, **Düzenleme Modalının** açılmasını engeller. |
| `altEditorFlags.preventDeleteModal` | `false` | `true` ise, **Silme Modalının** açılmasını engeller. |
| `altEditorFlags.preventAddSubmit` | `false` | `true` ise, **Ekleme Formunun** gönderilmesini engeller (modal açık kalır). |
| `altEditorFlags.preventEditSubmit` | `false` | `true` ise, **Düzenleme Formunun** gönderilmesini engeller (modal açık kalır). |
| `altEditorFlags.preventDeleteSubmit`| `false` | `true` ise, **Silme Formunun** gönderilmesini engeller (modal açık kalır). |

## 💻 Kapsamlı Örnek

```javascript
$(document).ready(function() {
    $('#example').DataTable({
        dom: 'Bfrtip',
        ajax: { url: './data.json', dataSrc: 'data' },
        
        // --- Global AltEditor Ayarları ---
        altEditor: true,
        encodeFiles: true,     // Dosyaları Base64'e çevir
        closeModalOnSuccess: true, 
        
        // --- Butonlar ---
        buttons: [
            { text: 'Ekle', name: 'add' },
            { extend: 'selected', text: 'Düzenle', name: 'edit' },
            { extend: 'selected', text: 'Sil', name: 'delete' },
            { text: 'Yenile', name: 'refresh' }
        ],

        // --- Kolon Tanımları ---
        columns: [
            { 
                data: 'id', title: 'ID', type: 'readonly' 
            },
            { 
                data: 'name', title: 'Ad', type: 'text', required: true,
                inline: true // "Ad" ve "Soyad" alanlarını aynı satıra koyar
            },
            { 
                data: 'surname', title: 'Soyad', type: 'text', required: true,
                inline: true 
            },
            { 
                data: 'role', title: 'Kullanıcı Rolü', type: 'select',
                options: [{id: '1', text: 'Yönetici'}, {id: '2', text: 'Kullanıcı'}],
                selectwanted: 'id', // '1' veya '2' gönderir
                optionsSortByLabel: true,
                select2: { width: '100%' }
            },
            { 
                data: 'dob', title: 'Doğum Tarihi', type: 'text',
                bootstrapdatepicker: { format: 'dd.mm.yyyy', autoclose: true }
            },
            { 
                data: 'avatar', title: 'Avatar', type: 'file',
                accept: 'image/png, image/jpeg'
            }
        ],

        // --- Kancalar (Hooks) & Callback'ler ---
        
        // 1. Örnek: "Yönetici" kullanıcıları için Düzenleme penceresini engelle
        onBeforeEditRow: function(dt, rowdata, success, error) {
            if (rowdata.role === '1') { // 1 = Yönetici
                 alert("Yönetici kayıtlarını düzenleyemezsiniz.");
                 // Modalı durdurmak için bayrağı kullanın:
                 altEditorFlags.preventEditModal = true; 
            } else {
                 altEditorFlags.preventEditModal = false;
            }
        },

        // 2. Sunucuya göndermeden önce validasyon yap
        onBeforeAddSubmitRow: function(dt, rowdata, success, error) {
            if (rowdata.name.length < 3) {
                alert('İsim çok kısa!');
                return; // Gönderimi iptal et
            }
            success(); // Devam et
        },

        // 3. Sunucu İşlemlerini Yönet
        onAddRow: function(dt, rowdata, success, error) {
            // encodeFiles:true olduğu için rowdata.avatar artık bir Base64 stringidir
            console.log("Ekleniyor:", rowdata);
            
            // AJAX Simülasyonu
            setTimeout(function() { success(rowdata); }, 500); 
        },
        onEditRow: function(dt, rowdata, success, error) {
            console.log("Düzenleniyor:", rowdata);
            success(rowdata);
        },
        onDeleteRow: function(dt, rowdata, success, error) {
            console.log("Siliniyor:", rowdata);
            success(rowdata);
        }
    });
});
```

## 📝 Emeği Geçenler & Lisans
* Orijinal Yazar: Kingkode
* Katkıda Bulunanlar: KasperOlesen, Luca Vercelli, Zack Hable
* Geliştirilmiş Sürüm: Eagle (trup40)
* Lisans: MIT