# GongFormat

GongFormat 是一个纯前端的 Markdown 排版工具，用来把 Markdown 内容整理成适合微信公众号后台粘贴的富文本格式。

它不需要后端服务，也不绑定任何默认图床。你可以直接打开 HTML 使用，也可以用 Docker 部署成一个小型 Web 工具。

## 功能

- Markdown 编辑与微信正文预览
- 一键复制 Markdown、HTML 或微信公众号可粘贴富文本
- 手机 / 桌面预览切换
- 本地草稿保存
- 主题样式与基础排版选项
- 图片拖拽 / 粘贴 / 选择上传
- 自定义图床或 CDN 上传接口
- 上传成功后自动把 Markdown 图片地址替换成公网 URL

## 快速使用

直接打开 `index.html` 即可使用大部分功能。

如果浏览器对剪贴板、图片上传或本地资源权限有限制，建议用本地静态服务打开：

```bash
python3 -m http.server 8000
```

然后访问：

```text
http://127.0.0.1:8000/
```

## Docker 部署

### Docker Compose（推荐）

无需在本地构建镜像，Compose 会直接拉取 GHCR 上的最新版本：

```bash
mkdir gongformat && cd gongformat
curl -O https://raw.githubusercontent.com/Lau0x/gongformat/main/docker-compose.yml
docker compose pull
docker compose up -d
```

访问：

```text
http://127.0.0.1:8080/
```

更新到最新版本：

```bash
docker compose pull
docker compose up -d
```

查看状态或停止服务：

```bash
docker compose ps
docker compose down
```

默认使用宿主机的 `8080` 端口。如需修改，请编辑 `docker-compose.yml` 中的 `8080:80`，将前面的 `8080` 改为所需端口。

### Docker Run

也可以直接运行 GHCR 镜像：

```bash
docker run -d \
  --name gongformat \
  -p 8080:80 \
  --restart unless-stopped \
  ghcr.io/lau0x/gongformat:latest
```

## 自行构建镜像

```bash
docker build -t gongformat .
docker run -d --name gongformat -p 8080:80 gongformat
```

## 图床配置

GongFormat 不内置任何默认图床地址。图片上传模块需要你自己填写上传接口。

默认请求方式：

- `POST`
- `multipart/form-data`
- 文件字段名默认：`image`
- Token 会作为 `token` 字段一起提交
- 返回 URL 字段默认读取：`url`

如果你的图床返回结构不同，可以在设置里修改“字段 image”和“URL 字段 url”。

Token 默认只保留在当前页面运行状态里。勾选“记住 Token（仅此浏览器）”后，Token 会保存在当前浏览器的本地存储中；它不会上传到 GongFormat 服务器。请勿在公共电脑上启用此选项。

## 发布 Docker 镜像

仓库内置 GitHub Actions：

- 发布 GitHub Release 时自动构建 Docker 镜像
- 推送到 GitHub Container Registry
- 默认生成 `latest`、版本号标签和 `major.minor` 标签

当前镜像：

```text
ghcr.io/lau0x/gongformat:latest
ghcr.io/lau0x/gongformat:<版本号，例如 v0.1.8>
```

每次发布 GitHub Release 时，工作流会自动构建 `linux/amd64` 和 `linux/arm64` 镜像，并推送 `latest`、完整版本号及 `major.minor` 标签。

## 技术栈

- HTML
- CSS
- JavaScript
- Nginx Docker 镜像用于静态托管

## 注意

GongFormat 复制到微信公众号后台时，会尽量保留标题、引用、代码块、图片、链接等样式。微信公众号后台自身也会做二次清洗，因此最终效果仍以后台预览为准。
