# IP Flag 隐私政策

生效日期：2026 年 8 月 11 日。

[English](privacy.html) · [Suomi](privacy-fi.html) · [Русский](privacy-ru.html) · [简体中文](privacy-zh_CN.html) · [فارسی](privacy-fa.html) · [Español](privacy-es.html) · [العربية](privacy-ar.html) · [Português (Brasil)](privacy-pt_BR.html) · [Bahasa Indonesia](privacy-id.html) · [Français](privacy-fr.html)

IP Flag 是一款浏览器扩展程序，用于在本地显示浏览器在互联网上呈现的信息：公共 IPv4/IPv6 地址、网络出口国家/地区和网络组织。

## 处理的数据

扩展程序会联系外部服务以确定浏览器的公共 IPv4 和 IPv6 地址。随后，这些地址会发送给 GeoIP 服务，以确定国家/地区和网络组织。

当前版本使用：

- `api.ipify.org`：公共 IPv4；
- `api6.ipify.org`：公共 IPv6；
- `api.ipapi.is`：国家/地区、ASN 和网络组织。
- `ipwho.is`：可选的地区和城市查询，仅在用户启用该设置时使用。

## 不收集的数据

IP Flag 不会请求或访问浏览历史、访问过的网址、页面内容、Cookie、搜索查询、密码、账户数据或设备的精确位置。

扩展程序不使用分析、广告、遥测、云同步或开发者运营的后端。

## 本地存储与传输

当前网络状态、所选旗帜样式和小型 GeoIP 缓存仅保存在浏览器的本地扩展存储中。GeoIP 缓存最多保留 24 小时，且不超过 50 个 IP 地址。

公共 IP 地址仅为提供扩展程序的核心功能而发送给上述服务，传输使用 HTTPS。

## 政策变更

如果数据处理方式发生重大变化，本页面会随新的扩展程序版本更新。
