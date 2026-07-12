# YAD APT repository

Binary packages for YAD built automatically from commits on `master`.

```sh
echo "deb [trusted=yes] https://raw.githubusercontent.com/KaKi87/yad/refs/heads/apt stable main" | sudo tee /etc/apt/sources.list.d/yad.list
sudo apt update
sudo apt install yad
```
