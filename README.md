# OpenOCD Tools On VSCode

一个简易的OpenOCD工具：封装OpenOCD的烧录操作和调试操作。

## Features

- 配置自动生成
- 自动识别MCU
- 烧录固件
- 调试固件

## Documentation

[OpenOCD-Tools使用文档](https://nanjo712.github.io/2024/07/28/OpenOCD-Tools%E4%BD%BF%E7%94%A8%E6%96%87%E6%A1%A3/)

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

### 0.0.6

- 自动识别MCU
- 增加选择调试器的功能
- 增加自动生成config文件的功能
- debug前自动烧录固件
- 自动扫描可用的固件文件
- 烧录前自动初始化OpenOCD，复位MCU

### 0.0.7

- 把所有反斜杠替换为正斜杠

### 0.0.8

- 仅替换targetFile中的斜杠

### 0.0.9

- 修复路径替换错误的问题

### 0.1.0

- 生成配置文件前需要选择调试器
- 修复配置文件路径的空格问题

### 0.1.2

- 添加依赖声明

### 0.1.3

- 在ELF文件不以ELF结尾时，通过文件头判断是否为ELF文件
- 修复IOC文件不存在时崩溃的问题

---

