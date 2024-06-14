# Boids simulation

Implementacja algorytmu stada opracowanego przez Craiga Raynoldsa. Może być wykorzystany do symulowania zachowań stad ptaków lub ryb w przestrzeni 3D.

# Class Overview

 **BoidsController** definiuje kontener dla jednostek. Wszystkie jednostki (zarówno zwierzęta, jak i przeszkody) są dodane do kontrolera. Oblicza on i aktualizuje pozycję i prędkość jednostek.

**Entity** definiuje model jednostki. Posiada takie atrybuty jak prędkość i pozycję oraz dostarcza metod pomocniczych.

**Grid** dzieli przestrzeń wykorzystywaną w symulacji na trójwymiarowe sześciany, co pozwala na szybsze obliczanie okolic określonej jednostki. Wykorzystuje technikę określaną jako "spatial-partition".

Jest to wariacja oryginalnego algorytmu utworzonego przez [Ercana Gercka](https://github.com/ercang/boids-js).