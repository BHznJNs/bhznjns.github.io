# Flutter Android 应用无法升级？

在刚开始开发 Flutter 应用时，我就注意到了一个问题，Flutter 应用的版本号很特殊，像这样：

```yaml
version: 1.0.0+1
```

我在开发时其实已经遇到问题了，具体表现就是没法直接安装 release 版本安装包，需要卸载当前已经安装的版本再安装。
我当时没太在意，只是以为是 debug 版本和 release 版本不兼容，直到后来有个用户和我反馈说应用无法升级到新版本，我才重视起来。

经过一番查询，我发现是 ``build-number`` 导致的，即版本号后边的那个数字。build-number 对应的是 ``AndroidManifest.xml`` 中的 ``versionCode``，需要在每次版本更新后递增。

- - -

## 其实应用签名也有影响（``2025/04/24`` 更新）

后来发现，由于 Flutter 应用的构建默认使用 Debug 的签名，会导致每次构建使用的签名不一致，使得新版本无法安装。需要使用 keytool 创建签名文件，在构建时使用自己的签名。

>>>找不到 keytool？
keytool 为 JDK 自带的二进制程序，可以在安装 JDK 后，在 `jdk/bin/` 目录下找到。
>>>

### 创建签名密钥

```shell
keytool -genkey -v -keystore <密钥名称>.jks -alias <密钥别名> -keyalg RSA -keysize 2048 -validity 30000
```

在调用上述命令后，程序会提示填入 keystore 的密码、别名的密码、名称等信息，依次填写即可。
有的时候可能不会提示填写别名的密码，此时别名的密码与 keystore 的密码相同。

在完成后，需要妥善保存密钥文件与对应密码。

### 在 CI 中使用签名

#### 创建密钥文件的 Base64 编码

```shell
# Unix
base64 -w 0 <你的密钥库名称>.jks
# Windows
[System.Convert]::ToBase64String([System.IO.File]::ReadAllBytes("<你的密钥库名称>.jks"))
```

#### 在 GitHub 仓库中添加 Secrets

在你的 GitHub 仓库页面，进入 Settings -> Secrets and variables -> Actions -> New repository secret.
添加以下 secrets：

- SIGNING_KEYSTORE: 粘贴上面 Base64 编码的密钥库文件内容。
- SIGNING_KEYSTORE_PASSWORD: 输入你生成密钥时设置的密钥库密码。
- SIGNING_KEY_ALIAS: 输入你设置的密钥别名。
- SIGNING_KEY_PASSWORD: 输入你设置的密钥别名密码。

#### 配置 ``build.gradle.kts`` 使用签名

在 ``android/app/build.gradle.kts`` 中进行修改。

在文件头部添加：
```kotlin
import java.util.Properties
import java.io.FileInputStream

val signingPropertiesFile = file("signing.properties")
val signingProperties = Properties()

if (signingPropertiesFile.exists()) {
    signingProperties.load(FileInputStream(signingPropertiesFile))
    println(">>> Loaded signing.properties")
} else {
    println(">>> signing.properties not found. Release build might not be signed correctly.")
}

// 从 properties 中读取值
val storeFileProp = signingProperties.getProperty("storeFile")
val storePasswordProp = signingProperties.getProperty("storePassword")
val keyAliasProp = signingProperties.getProperty("keyAlias")
val keyPasswordProp = signingProperties.getProperty("keyPassword")
```

在 android 块中添加：
```kotlin
android {
    // ... 其他 android 块内的配置，例如 compileSdk, defaultConfig, etc.

    signingConfigs {
        // 创建一个名为 "release" 的 signing config
        create("release") {
            // 只有在 signing.properties 文件存在且属性都被读取到时才应用配置
            if (storeFileProp != null && storePasswordProp != null && keyAliasProp != null && keyPasswordProp != null) {
                storeFile = file(storeFileProp)
                storePassword = storePasswordProp
                keyAlias = keyAliasProp
                keyPassword = keyPasswordProp
            } else {
                println(">>> Incomplete signing properties. Release build may not be signed correctly.")
            }
        }
    }
    // 修改原有的 buildTypes 块
    buildTypes {
        release {
            if (storeFileProp != null) {
                // 使用前面创建的 "release" signing config
                signingConfig = signingConfigs.getByName("release")
            } else {
                println(">>> Release build signing config not applied.")
            }
        }
    }
}
```
#### 配置 GitHub Actions 脚本

在构建 APK 的步骤前加入如下两步：

```yaml
steps:
  # ... 其他 steps (如 checkout, setup flutter)

  - name: Decode Keystore
    working-directory: ${{ env.APK_BUILD_DIR }}
    run: |
      echo "${{ secrets.SIGNING_KEYSTORE }}" | base64 -d > android/app/my_app_release_key.jks
    shell: bash

  - name: Create Signing Properties
    working-directory: ${{ env.APK_BUILD_DIR }}
    run: |
      echo "storeFile=my_app_release_key.jks" > android/app/signing.properties
      echo "storePassword=${{ secrets.SIGNING_KEYSTORE_PASSWORD }}" >> android/app/signing.properties
      echo "keyAlias=${{ secrets.SIGNING_KEY_ALIAS }}" >> android/app/signing.properties
      echo "keyPassword=${{ secrets.SIGNING_KEY_PASSWORD }}" >> android/app/signing.properties
    shell: bash

  # 构建 APK、发布等
```

