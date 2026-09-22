# 中文和合本圣经

Chinese Union Version Bible

参考 https://www.chinesebibleonline.com/ 的独立无广告版本。

在线阅读：https://cuvbible.com/

## 打开

直接用浏览器打开 `index.html`，即可离线使用。也可以在本目录运行：

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

然后访问 http://127.0.0.1:8765 。书签和设置按浏览器及网址分别保存。

## 功能

- 全部 66 卷、1,189 章，旧约 / 新约目录。
- 和合本简繁经文、KJV 对照、章节切换、节号深链接。
- 全文关键词检索，简繁关键词均可搜索；支持英文检索、范围筛选、结果分页。
- 字号调整、阅读记录、本地书签、章节复制、三种版本全文 TXT 下载。
- 圣经动态：收录译本与阅读工具消息，并附原始来源及配图。
- NET 圣经中文版简体 PDF：译者序、66 卷逐卷下载及包含全部文件的 ZIP 包。
- 手机适配，无第三方脚本、广告或统计请求。

NIV 未内置。此版本重做原站核心阅读功能，并非原站后台和全部资源的镜像。

## 数据与复现

经文来自 GetBible v2 的 `cus`、`cut`、`kjv`。中文译本元数据标为 Public Domain，KJV 数据元数据标为 GPL；完整来源、权利声明及版本在 `data/translation-metadata.json`。原始响应 gzip 和 SHA-256 一同保留。中文仅去掉 ASCII 空格与行尾空白，未机械转换繁简、未改写经文。简繁分别来自原始数据。不同译本分节可能不同，按明确节号显示，缺失节号明示而非挪移文字。

`python3 build_data.py` 可从随附原始数据重建 `data/bible.js`，不需要网络和额外依赖。

首页风景图来自参考站，权利归其权利人所有；本站标识重新绘制。

## NET 中文版 PDF 下载

下载目录：https://cuvbible.com/downloads/net-chinese/

原始来源：https://bible.org/chinese/e/download/pdf （简体文件，原站更新日期 2011-12-15）。

`downloads/net-chinese/pdf/` 保留译者序和 66 卷原始 PDF，未改写内容。
`downloads/net-chinese/sc_pdf_20111215.zip` 包含全部 67 份 PDF；
`downloads/net-chinese/manifest.json` 记录文件大小、SHA-256 和来源，供核对文件完整性。
版权与使用说明见原始来源及译者序。

## 圣经动态

栏目地址：https://cuvbible.com/#news 。原 `#bookmarks` 地址自动转到该栏目。
首条收录微读圣经上线 LSB 译本的消息，正文及配图由用户提供，原帖链接随文保留。
配图位于 `assets/news/wedevote-lsb.jpg`；页面标注的是本站收录日期，不推算原帖发布时间。
阅读页的“我的书签”入口改用 `#saved`，继续读取原有浏览器书签。

## 验证

浏览器实测：选约翰福音 3 章、繁体 / KJV 切换、搜索“神爱世人”并跳转 3:16、书签刷新保存、新约目录、390px 手机宽度无横向溢出。更多结果见 `VERIFICATION.md`。
