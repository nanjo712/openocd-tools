# openocd-tools README

A simple tools for openocd. 

Only support STM32 for now.

## Features

- Flash firmware
- Debug firmware

## Requirements

- openocd
- cmake-tools extension on VSCode
- ARM GNU Toolchain

## Extension Settings

This extension contributes the following settings:

* `openocd-tools.path`: Path to openocd executable
* `openocd-tools.cfg`: Path to openocd configuration file
* `openocd-tools.target`: Path to target firmware

## Known Issues

- Only support STM32 for now

## Release Notes

### 0.0.1

Initial release of openocd-tools

### 0.0.2

Fix bug: path error

### 0.0.3

- 修复不能正确识别反斜杠的问题
- 修复终端关闭后无法再次打开的问题

### 0.0.4

- 修复正则表达式格式错误的问题

---

