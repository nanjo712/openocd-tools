# OpenOCD Tools On VSCode

一个简易的OpenOCD工具：封装OpenOCD的烧录操作和调试操作。

## Features

- 烧录固件
- 调试固件

## Requirements

- OpenOCD
- CMake Tools 拓展
-  Embedded Tools 拓展（可选）
  - 查看外设寄存器
  - 调试RTOS

- RTOS Views / Peripheral Viewer （可选）
  - 查看外设寄存器
  - 调试RTOS


## Extension Settings

使用该拓展前，需要设置OpenOCD可执行文件的路径

- `openocd-tools.path`：指定一个OpenOCD可执行的路径
  - 默认值：`openocd`
  - 示例：`/usr/bin/openocd`或者`XXX/openocd.exe`

## Known Issues

- 依赖CMake进行编译

## Release Notes

### 0.0.1

初次发布

### 0.0.2

- 修复路径获取错误的问题

### 0.0.3

- 修复不能正确识别反斜杠的问题
- 修复终端关闭后无法再次打开的问题

### 0.0.4

- 修复正则表达式格式错误的问题

### 0.0.5

- 更新文档和图标，增加文字描述

---

