[![](https://shields.kaki87.net/badge/github.com-main-blue?style=flat&logo=github)](https://github.com/KaKi87/yad)
[![](https://shields.kaki87.net/github/stars/KaKi87/yad)](https://github.com/KaKi87/yad)

[![](https://shields.kaki87.net/badge/git.kaki87.net-mirror-green?style=flat&logo=forgejo)](https://git.kaki87.net/KaKi87/yad)
[![](https://shields.kaki87.net/gitea/stars/KaKi87/yad?gitea_url=https%3A%2F%2Fgit.kaki87.net&logo=forgejo)](https://git.kaki87.net/KaKi87/yad)

# Yet Another Dialog (YAD), AI-augmented

Original `README.md` :
- [on `master` branch synced with upstream](https://github.com/KaKi87/yad/blob/master/README.md) ;
- [on `dev` branch at fork time](https://github.com/KaKi87/yad/blob/dev/README.md) ;
- [on `master` branch from upstream](https://github.com/v1cont/yad/blob/master/README.md).

## Exclusive features

### APT repository

For Debian/Ubuntu-based distros, add `yad` to APT for automated updates :

```bash
echo "deb [trusted=yes] https://raw.githubusercontent.com/KaKi87/yad/refs/heads/apt stable main" | sudo tee /etc/apt/sources.list.d/yad.list
sudo apt update
sudo apt install yad
```

### GitHub Releases

From the [latest release](https://github.com/KaKi87/yad/releases/latest), download :

| Architecture \ Package type | DEB package       | Standalone binary |
| --------------------------- | ----------------- | ----------------- |
| **`amd64`/`x86-64`**        | `yad_*_amd64.deb` | `yad-linux-amd64` |
| **`arm64` / `aarch64`**     | `yad_*_arm64.deb` | `yad-linux-arm64` |

## Third-party resources

- [yad-guide.ingk.se](https://yad-guide.ingk.se) (outdated)
- [doc.ubuntu-fr.org/yad_yet_another_dialog](https://doc.ubuntu-fr.org/yad_yet_another_dialog) (outdated)
- [man.archlinux.org/man/yad.1.en](https://man.archlinux.org/man/yad.1.en)
