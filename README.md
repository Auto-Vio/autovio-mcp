# AutoVio MCP Server

AutoVio API'sini Model Context Protocol (MCP) üzerinden kullanmanızı sağlayan sunucu. Claude Desktop ve diğer MCP istemcileriyle uyumludur.

## Kurulum

```bash
npm install
npm run build
```

## Hızlı Başlangıç

### Yapılandırma

Config dört kaynaktan yüklenir; **öncelik: CLI parametreleri > ortam değişkenleri > config dosyası > varsayılanlar**.

**CLI parametreleri** – Sadece 4 AI çifti (model adı + API key). Provider gerekmez (model adından türetilir):

| Parametre | Açıklama |
|-----------|----------|
| `--config` | Config JSON dosya yolu |
| `--autovio-base-url` | AutoVio API base URL |
| `--autovio-api-token` | AutoVio API token |
| **Video Analysis** | |
| `--vision-model` | Model adı (örn. gemini-2.0-flash-exp) |
| `--vision-api-key` | API key |
| **LLM** | |
| `--llm-model` | Model adı (örn. gemini-2.5-flash) |
| `--llm-api-key` | API key |
| **Image Generate** | |
| `--image-model` | Model adı (örn. gemini-2.5-flash-image) |
| `--image-api-key` | API key |
| **Video Generate** | |
| `--video-model` | Model adı (örn. veo-3.0-generate-001) |
| `--video-api-key` | API key |
| `--log-level` | `debug` \| `info` \| `warn` \| `error` |
| `--enable-resources` | `true` \| `false` |
| `--enable-prompts` | `true` \| `false` |

`--autovioBaseUrl` gibi camelCase yazım da kabul edilir.

**Ortam değişkenleri**: `AUTOVIO_BASE_URL`, `AUTOVIO_API_TOKEN`, `AUTOVIO_VISION_MODEL`, `AUTOVIO_VISION_API_KEY`, `AUTOVIO_LLM_MODEL`, `AUTOVIO_LLM_API_KEY`, `AUTOVIO_IMAGE_MODEL`, `AUTOVIO_IMAGE_API_KEY`, `AUTOVIO_VIDEO_MODEL`, `AUTOVIO_VIDEO_API_KEY`, `AUTOVIO_LOG_LEVEL`, `AUTOVIO_MCP_CONFIG`.

Örnek config dosyası: `examples/config.example.json`

### Çalıştırma

```bash
# Varsayılan (env veya default baseUrl/token)
node dist/index.js

# Config dosyası ile
node dist/index.js --config examples/config.example.json

# Geliştirme (watch)
npm run dev
```

### Claude Desktop

Tüm config değerlerini parametre olarak verebilirsiniz. Örnek: `examples/claude-desktop-config.json`

```json
{
  "mcpServers": {
    "autovio": {
      "command": "node",
      "args": [
        "/absolute/path/to/AutoVio-MCP/dist/index.js",
        "--autovio-base-url", "http://localhost:3001",
        "--autovio-api-token", "YOUR_TOKEN",
        "--vision-model", "gemini-2.0-flash-exp",
        "--vision-api-key", "YOUR_VISION_KEY",
        "--llm-model", "gemini-2.5-flash",
        "--llm-api-key", "YOUR_LLM_KEY",
        "--image-model", "gemini-2.5-flash-image",
        "--image-api-key", "YOUR_IMAGE_KEY",
        "--video-model", "veo-3.0-generate-001",
        "--video-api-key", "YOUR_VIDEO_KEY"
      ]
    }
  }
}
```

Sadece env ile de çalışır:

```json
{
  "mcpServers": {
    "autovio": {
      "command": "node",
      "args": ["/path/to/AutoVio-MCP/dist/index.js"],
      "env": {
        "AUTOVIO_BASE_URL": "http://localhost:3001",
        "AUTOVIO_API_TOKEN": "your-token",
        "AUTOVIO_LLM_API_KEY": "your-llm-key"
      }
    }
  }
}
```

## Mevcut Araçlar (Tools)

- **autovio_health** – API sağlık kontrolü
- **autovio_auth_login** – Giriş (email, password)
- **autovio_auth_register** – Yeni kullanıcı kaydı
- **autovio_auth_me** – Mevcut kullanıcı bilgisi
- **autovio_projects_list** – Proje listesi
- **autovio_projects_create** – Proje oluşturma
- **autovio_projects_get** – Proje detayı
- **autovio_projects_update** – Proje güncelleme
- **autovio_projects_delete** – Proje silme
- **autovio_works_list** – Work listesi
- **autovio_works_create** – Work oluşturma
- **autovio_works_get** – Work detayı
- **autovio_works_update** – Work güncelleme
- **autovio_works_delete** – Work silme
- **autovio_works_apply_template** – Work’e şablon uygulama
- **autovio_ai_analyze_video** – Referans video analizi (base64 video)
- **autovio_ai_generate_scenario** – Senaryo üretimi (intent + analysis)
- **autovio_ai_generate_scenario_for_work** – Work için senaryo üretimi
- **autovio_ai_generate_image** – Görsel üretimi
- **autovio_ai_generate_video** – Görselden video üretimi
- **autovio_ai_generate_scene** – Tek sahne için görsel + video
- **autovio_providers_list** – Kullanılabilir AI provider listesi
- **autovio_templates_list** – Şablon listesi
- **autovio_templates_get** – Şablon detayı
- **autovio_templates_create** – Şablon oluşturma
- **autovio_templates_update** – Şablon güncelleme
- **autovio_templates_delete** – Şablon silme

API detayları için proje kökündeki `document.ts` (OpenAPI) kullanılabilir.

## Gereksinimler

- Node.js >= 18
- AutoVio API erişimi (baseUrl + apiToken veya login)

## Lisans

MIT
