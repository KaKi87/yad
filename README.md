# YAD APT repository

Binary packages for YAD built automatically from commits on `master`.

Enable GitHub Pages for the `apt` branch, then install with:

```sh
echo "deb [trusted=yes] https://KaKi87.github.io/yad stable main" | sudo tee /etc/apt/sources.list.d/yad.list
sudo apt update
sudo apt install yad
```
