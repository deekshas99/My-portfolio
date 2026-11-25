import { BufferGeometry, Float32BufferAttribute, Matrix3, Matrix4, Vector3 } from 'three';

/** Deterministic layout: the same garden grows on every visit. */
export type Random = () => number;
export function makeRandom(seed: number): Random {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Point = [number, number, number];
export type MeshData = { position: number[]; normal: number[]; uv: number[]; sway: number[]; tint: number[]; seed: number[]; index: number[] };
export const meshData = (): MeshData => ({ position: [], normal: [], uv: [], sway: [], tint: [], seed: [], index: [] });

/** Parametric strip. Normals come from the surface itself, so leaves catch light
    along their curl, and the uv grid is what the glyph surface is drawn into. */
function addSurface(mesh: MeshData, cols: number, rows: number, tint: number, stiffness: number, point: (u: number, v: number) => Point, seed = 0) {
  const start = mesh.position.length / 3;
  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      const u = i / cols, v = j / rows, e = 1e-3;
      const p = point(u, v);
      const uBack = u >= 1, vBack = v >= 1;
      const pu = point(uBack ? u - e : u + e, v), pv = point(u, vBack ? v - e : v + e);
      const du: Point = [pu[0] - p[0], pu[1] - p[1], pu[2] - p[2]];
      const dv: Point = [pv[0] - p[0], pv[1] - p[1], pv[2] - p[2]];
      if (uBack) { du[0] = -du[0]; du[1] = -du[1]; du[2] = -du[2]; }
      if (vBack) { dv[0] = -dv[0]; dv[1] = -dv[1]; dv[2] = -dv[2]; }
      const n: Point = [du[1] * dv[2] - du[2] * dv[1], du[2] * dv[0] - du[0] * dv[2], du[0] * dv[1] - du[1] * dv[0]];
      const len = Math.hypot(n[0], n[1], n[2]) || 1;
      mesh.position.push(p[0], p[1], p[2]);
      mesh.normal.push(n[0] / len, n[1] / len, n[2] / len);
      mesh.uv.push(u, v);
      mesh.sway.push(Math.pow(Math.max(0, p[1]), 1.35) * stiffness);
      mesh.tint.push(tint);
      mesh.seed.push(seed);
    }
  }
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const a = start + j * (cols + 1) + i;
    mesh.index.push(a, a + cols + 1, a + 1, a + 1, a + cols + 1, a + cols + 2);
  }
}

const bakePoint = new Vector3(), bakeNormal = new Vector3(), bakeBasis = new Matrix3();
function bake(target: MeshData, local: MeshData, matrix: Matrix4, swayScale = 1, tintShift = 0, seedShift = 0) {
  const offset = target.position.length / 3;
  bakeBasis.getNormalMatrix(matrix);
  for (let i = 0; i < local.position.length; i += 3) {
    bakePoint.set(local.position[i], local.position[i + 1], local.position[i + 2]).applyMatrix4(matrix);
    bakeNormal.set(local.normal[i], local.normal[i + 1], local.normal[i + 2]).applyMatrix3(bakeBasis).normalize();
    target.position.push(bakePoint.x, bakePoint.y, bakePoint.z);
    target.normal.push(bakeNormal.x, bakeNormal.y, bakeNormal.z);
  }
  for (let i = 0; i < local.sway.length; i++) {
    target.sway.push(local.sway[i] * swayScale);
    target.tint.push(Math.min(1, Math.max(0, local.tint[i] + tintShift)));
    target.seed.push(local.seed[i] + seedShift);
  }
  for (let i = 0; i < local.uv.length; i++) target.uv.push(local.uv[i]);
  for (let i = 0; i < local.index.length; i++) target.index.push(local.index[i] + offset);
}

export function toGeometry(mesh: MeshData): BufferGeometry {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(mesh.position, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(mesh.normal, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(mesh.uv, 2));
  geometry.setAttribute('aSway', new Float32BufferAttribute(mesh.sway, 1));
  geometry.setAttribute('aTint', new Float32BufferAttribute(mesh.tint, 1));
  geometry.setAttribute('aSeed', new Float32BufferAttribute(mesh.seed, 1));
  geometry.setIndex(mesh.index);
  geometry.computeBoundingSphere();
  return geometry;
}

const place = new Matrix4(), spin = new Matrix4();
function transform(x: number, y: number, z: number, scale: number, yaw: number, tilt = 0) {
  place.makeTranslation(x, y, z);
  place.multiply(spin.makeRotationY(yaw));
  if (tilt) place.multiply(spin.makeRotationZ(tilt));
  return place.multiply(spin.makeScale(scale, scale, scale));
}

/* ----------------------------------------------------------------
   species
   Each plant grows from the origin along +Y and is placed later.
   Sizes are in metres: nothing here is taller than a knee except
   the seed heads, which are the only things meant to break the sky.
---------------------------------------------------------------- */

function grassBlade(r: Random): MeshData {
  const mesh = meshData();
  const height = .26 + r() * .6, bend = .2 + r() * .62, width = .005 + r() * .011;
  const twist = (r() - .5) * 1.1, cup = .4 + r() * .9;
  addSurface(mesh, 1, 6, .1 + r() * .55, 1, (u, v) => {
    const s = u * 2 - 1, half = width * (1 - Math.pow(v, 1.5) * .97);
    return [bend * height * v * v + s * half * cup * Math.abs(s) * .4, height * v * (1 - .14 * v), s * half + twist * v * v * half];
  }, 3 + Math.floor(r() * 12));
  return mesh;
}

/** Grass grows in tufts, which is most of what keeps the bed from looking sown. */
function grassTuft(r: Random): MeshData {
  const mesh = meshData();
  const blades = 6 + Math.floor(r() * 7);
  for (let i = 0; i < blades; i++) {
    const angle = r() * Math.PI * 2, radius = r() * .07;
    bake(mesh, grassBlade(r), transform(Math.cos(angle) * radius, 0, Math.sin(angle) * radius, .8 + r() * .5, r() * Math.PI * 2, (r() - .5) * .5));
  }
  return mesh;
}

/** Arching pinnate frond: a rachis with leaflets that shorten toward the tip. */
function fernFrond(r: Random): MeshData {
  const mesh = meshData();
  const length = .26 + r() * .4, arch = .3 + r() * .55, tint = .04 + r() * .26;
  const pairs = 11 + Math.floor(r() * 7), lift = .06 + r() * .2;
  const spine = (t: number): Point => [arch * length * t * t, length * t * (1 - .2 * t) + lift * t, 0];
  addSurface(mesh, 1, 7, tint, 1, (u, v) => {
    const p = spine(v), s = u * 2 - 1;
    return [p[0], p[1], p[2] + s * .005 * (1 - v)];
  }, 7);
  for (let i = 0; i < pairs; i++) {
    const t = .1 + (i / pairs) * .87;
    const base = spine(t), span = length * .3 * (1 - Math.pow(t, 1.6) * .85);
    for (const side of [-1, 1]) {
      addSurface(mesh, 1, 2, tint + .1, 1, (u, v) => {
        const s = u * 2 - 1, half = span * .16 * (1 - v * v * .92);
        return [base[0] + span * v * .3, base[1] + span * v * .5 + s * half * .5, base[2] + side * span * v + s * half];
      }, 11 + i);
    }
  }
  return mesh;
}

/** A crown of fronds, the way ferns actually stand in a bed. */
function fernClump(r: Random): MeshData {
  const mesh = meshData();
  const fronds = 3 + Math.floor(r() * 4);
  for (let i = 0; i < fronds; i++) {
    const angle = (i / fronds) * Math.PI * 2 + r() * .8;
    bake(mesh, fernFrond(r), transform(0, 0, 0, .85 + r() * .4, angle, (r() - .5) * .3));
  }
  return mesh;
}

/** Wide cupped leaf on a short petiole, the hosta-like mass low in the bed. */
function broadLeaf(r: Random): MeshData {
  const mesh = meshData();
  const length = .15 + r() * .25, width = .075 + r() * .13, droop = .18 + r() * .3;
  const stalk = .06 + r() * .16, cup = .12 + r() * .3, tint = .22 + r() * .36;
  addSurface(mesh, 5, 6, tint, .8, (u, v) => {
    const s = u * 2 - 1, t = v;
    const half = width * Math.pow(Math.sin(Math.PI * Math.pow(Math.min(1, t + .07), .8)), .75);
    const rise = stalk + length * t * (1 - droop * t * .6);
    return [s * half, rise - droop * length * t * t * .55 + cup * half * s * s * .5, length * t * .32 + cup * half * s * s * .3];
  }, 17);
  addSurface(mesh, 1, 2, .14, 1, (u, v) => {
    const s = u * 2 - 1;
    return [s * .008, stalk * v, s * .008];
  }, 5);
  return mesh;
}

/** Bare stem into a fine umbel: the airy silhouettes standing over the leaves. */
function umbelPlant(r: Random): MeshData {
  const mesh = meshData();
  const height = .2 + r() * .36, lean = (r() - .5) * .25, spokes = 12 + Math.floor(r() * 9);
  const reach = .03 + r() * .05, tint = .08 + r() * .22;
  addSurface(mesh, 1, 6, tint, 1, (u, v) => {
    const s = u * 2 - 1;
    return [lean * v * v + s * .005, height * v, s * .005];
  }, 13);
  for (let i = 0; i < spokes; i++) {
    const angle = (i / spokes) * Math.PI * 2 + r() * .4, span = reach * (.65 + r() * .7);
    addSurface(mesh, 1, 2, tint + .28, 1, (u, v) => {
      const s = u * 2 - 1, half = .0035 * (1 - v * .5);
      return [lean + Math.cos(angle) * span * v + s * half, height + span * v * (1.15 - v * 1.6), Math.sin(angle) * span * v + s * half];
    }, 19 + i);
  }
  return mesh;
}

/** Small warm bloom: the petals go to the bloom layer, the stem stays with the foliage. */
function wildflower(r: Random): { stem: MeshData; petals: MeshData } {
  const stem = meshData(), petals = meshData();
  const height = .2 + r() * .45, lean = (r() - .5) * .3, tint = .45 + r() * .55;
  const count = 5, radius = .016 + r() * .022;
  addSurface(stem, 1, 5, .06 + r() * .18, 1, (u, v) => {
    const s = u * 2 - 1;
    return [lean * v * v + s * .005, height * v, s * .005];
  }, 23);
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + r() * .4;
    addSurface(petals, 1, 2, tint, 1, (u, v) => {
      const s = u * 2 - 1, half = radius * .46 * Math.sin(Math.PI * Math.min(1, v + .3));
      return [lean + Math.cos(angle) * radius * v + s * half * Math.sin(angle), height + radius * .22 * (1 - v), Math.sin(angle) * radius * v - s * half * Math.cos(angle)];
    }, 29 + i);
  }
  return { stem, petals };
}

/** The pale drawings standing behind the bed: thin, flat and graphic, like a
    painted backdrop rather than a plant with volume. */
function skeletonPlant(r: Random): MeshData {
  const mesh = meshData();
  const height = .5 + r() * .8, ribs = 12 + Math.floor(r() * 12), tint = r();
  const spread = .07 + r() * .13, fan = r() < .3, thin = .0022;
  addSurface(mesh, 1, 6, tint, .6, (u, v) => {
    const s = u * 2 - 1;
    return [s * thin, height * v, 0];
  }, 31);
  for (let i = 0; i < ribs; i++) {
    const t = .18 + (i / ribs) * .8, span = spread * (fan ? .35 + t * .9 : 1 - Math.pow(t, 1.7) * .82) * (.8 + r() * .4);
    for (const side of [-1, 1]) {
      addSurface(mesh, 1, 2, tint, .6, (u, v) => {
        const s = u * 2 - 1, half = thin * (1 - v * .6);
        return [side * span * v + s * half, height * t + span * v * .75 + s * half, 0];
      }, 37 + i);
    }
  }
  return mesh;
}

/* ----------------------------------------------------------------
   the bed
---------------------------------------------------------------- */

export type GardenGeometry = { foliage: BufferGeometry; blooms: BufferGeometry; backdrop: BufferGeometry };

const NEAR = 5.9, FAR = -6.8;

/** Plants crowd toward the camera, so the bed reads as depth rather than a flat row. */
function depthSpot(r: Random): { x: number; z: number; depth: number } {
  const depth = r();
  const z = FAR + (NEAR - FAR) * Math.pow(depth, 1.15);
  return { x: (r() * 2 - 1) * (3.2 + (7.8 - z) * .62), z, depth };
}

/** Each plant takes its own place on the green ramp, so neighbours differ the
    way real species do rather than reading as one cloned shrub. */
function scatter(r: Random, count: number, grow: (r: Random) => MeshData, into: MeshData, base: number, vary: number) {
  for (let i = 0; i < count; i++) {
    const { x, z, depth } = depthSpot(r);
    const scale = (base + r() * vary) * (.82 + depth * .3);
    bake(into, grow(r), transform(x, -.04 - r() * .1, z, scale, r() * Math.PI * 2, (r() - .5) * .26), scale, (r() - .5) * .42, Math.floor(r() * 64));
  }
}

export function buildGarden(mobile: boolean): GardenGeometry {
  const r = makeRandom(20260920);
  const density = mobile ? .45 : 1;
  const foliage = meshData(), blooms = meshData(), backdrop = meshData();
  const many = (n: number) => Math.round(n * density);

  scatter(r, many(470), grassTuft, foliage, .95, .6);
  scatter(r, many(230), fernClump, foliage, .9, .6);
  scatter(r, many(340), broadLeaf, foliage, .7, .45);
  scatter(r, many(150), umbelPlant, foliage, .9, .6);

  // A fringe within arm's reach, so the frame never opens onto bare ground.
  for (let i = 0; i < many(170); i++) {
    const scale = .65 + r() * .45;
    bake(foliage, r() < .55 ? grassTuft(r) : fernClump(r),
      transform((r() * 2 - 1) * 2.9, -.05, 6.2 + r() * 1.3, scale, r() * Math.PI * 2, (r() - .5) * .3), scale, (r() - .5) * .4);
  }

  for (let i = 0; i < many(420); i++) {
    const { x, z, depth } = depthSpot(r);
    const scale = (.95 + r() * .5) * (.82 + depth * .3);
    const matrix = transform(x, -.04, z, scale, r() * Math.PI * 2, (r() - .5) * .3);
    const flower = wildflower(r);
    bake(foliage, flower.stem, matrix, scale);
    bake(blooms, flower.petals, matrix, scale, (r() - .5) * .6);
  }

  // Far enough back that the bed always overlaps their feet and the trees
  // stay above their heads.
  for (let i = 0; i < many(70); i++) {
    const z = -13 + r() * 4, scale = .9 + r() * .6;
    bake(backdrop, skeletonPlant(r), transform((r() * 2 - 1) * 12, -.1, z, scale, (r() - .5) * .4, (r() - .5) * .1), scale);
  }

  return { foliage: toGeometry(foliage), blooms: toGeometry(blooms), backdrop: toGeometry(backdrop) };
}

/* ----------------------------------------------------------------
   message flowers
---------------------------------------------------------------- */

/** Slender stem for a seed head, tapering as it rises. */
export function createStemGeometry(height: number, lean: number): BufferGeometry {
  const mesh = meshData();
  const sides = 5, rows = 18;
  for (let j = 0; j <= rows; j++) {
    const v = j / rows, radius = .014 * (1 - v * .55), y = height * v;
    const x = lean * v * v, z = lean * .4 * v * v * v;
    for (let i = 0; i <= sides; i++) {
      const a = (i / sides) * Math.PI * 2;
      mesh.position.push(x + Math.cos(a) * radius, y, z + Math.sin(a) * radius);
      mesh.normal.push(Math.cos(a), .12, Math.sin(a));
      mesh.uv.push(i / sides, v);
      mesh.sway.push(Math.pow(v, 1.5));
      mesh.tint.push(.18);
      mesh.seed.push(41);
    }
  }
  for (let j = 0; j < rows; j++) for (let i = 0; i < sides; i++) {
    const a = j * (sides + 1) + i;
    mesh.index.push(a, a + sides + 1, a + 1, a + 1, a + sides + 1, a + sides + 2);
  }
  return toGeometry(mesh);
}

/** Seed head: filaments on a fibonacci sphere, each fading toward its tip. */
export function createSeedHeadGeometry(count = 190): BufferGeometry {
  const mesh = meshData();
  const golden = Math.PI * (3 - Math.sqrt(5));
  const dir = new Vector3(), side = new Vector3();
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2, radius = Math.sqrt(Math.max(0, 1 - y * y)), angle = i * golden;
    dir.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    side.set(-dir.z, 0, dir.x);
    if (side.lengthSq() < 1e-6) side.set(1, 0, 0);
    side.normalize();
    const reach = .82 + (i % 7) * .026;
    const x = dir.x, dy = dir.y, z = dir.z, sx = side.x, sy = side.y, sz = side.z;
    addSurface(mesh, 1, 2, 0, 0, (u, v) => {
      const s = u * 2 - 1, half = .012 * (1 - v * .45), t = .16 + v * reach;
      return [x * t + sx * s * half, dy * t + sy * s * half, z * t + sz * s * half];
    });
    // Filaments brighten along their length, so the head keeps a dim core.
    const tail = mesh.tint.length;
    for (let k = 0; k < 6; k++) mesh.tint[tail - 6 + k] = k < 2 ? 0 : k < 4 ? .55 : 1;
  }
  return toGeometry(mesh);
}

/** Bright tips, drawn as points so the head keeps a soft edge. */
export function createSeedTipGeometry(count = 190): BufferGeometry {
  const positions: number[] = [], seeds: number[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2, radius = Math.sqrt(Math.max(0, 1 - y * y)), angle = i * golden;
    const reach = .98 + (i % 7) * .026;
    positions.push(Math.cos(angle) * radius * reach, y * reach, Math.sin(angle) * radius * reach);
    seeds.push(i % 16);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new Float32BufferAttribute(seeds, 1));
  geometry.computeBoundingSphere();
  return geometry;
}

/* ----------------------------------------------------------------
   blossoms
   The original cupped bloom. UVs follow each petal's growth direction so
   the character surface runs outward with the petal rather than across it.
---------------------------------------------------------------- */

export function createBlossomGeometry(detail = 32): BufferGeometry {
  const positions: number[] = [], uvs: number[] = [], seeds: number[] = [], indices: number[] = [];
  for (let layer = 0; layer < 2; layer++) {
    const petals = layer === 0 ? 7 : 5, scale = layer === 0 ? 1 : .68;
    for (let petal = 0; petal < petals; petal++) {
      const angle = petal * Math.PI * 2 / petals + layer * .57;
      const start = positions.length / 3, cols = Math.round(detail * .7), rows = detail;
      for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) {
        const t = j / rows, s = i / cols * 2 - 1;
        const width = .018 + .65 * Math.pow(Math.sin(Math.PI * .79 * t), .8);
        const radial = .075 + (1.15 + .045 * Math.sin(petal * 2.7)) * t - .20 * s * s * t + .022 * Math.sin(s * 6 + petal) * t * t;
        const side = s * width;
        const curl = .05 + .42 * t * t + .26 * s * s * t + .10 * Math.sin(t * 7 + s * 3 + petal * .8) * t;
        positions.push((Math.sin(angle) * radial + Math.cos(angle) * side) * scale,
          (Math.cos(angle) * radial - Math.sin(angle) * side) * scale,
          curl * scale + layer * .10);
        uvs.push(i / cols, t); seeds.push(petal + layer * 13);
      }
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const a = start + j * (cols + 1) + i, b = a + 1, c = a + cols + 1, d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('aSeed', new Float32BufferAttribute(seeds, 1));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

export function createPollenGeometry(): BufferGeometry {
  const positions: number[] = [], seeds: number[] = [];
  for (let i = 0; i < 210; i++) {
    const t = i / 209, r = .235 * Math.sqrt(t), a = i * 2.399963;
    positions.push(Math.cos(a) * r, Math.sin(a) * r, .24 + .15 * Math.sqrt(1 - t));
    seeds.push(i % 16);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new Float32BufferAttribute(seeds, 1));
  geometry.computeBoundingSphere();
  return geometry;
}

/* ----------------------------------------------------------------
   the invitation
   A botanical line drawing rather than a plant: outlines, veins and a
   ringed centre, built as segment pairs for LineSegments.
---------------------------------------------------------------- */

function segments() {
  const points: number[] = [];
  const seg = (a: Point, b: Point) => points.push(a[0], a[1], a[2], b[0], b[1], b[2]);
  const strip = (path: Point[]) => { for (let i = 0; i < path.length - 1; i++) seg(path[i], path[i + 1]); };
  const ring = (radius: number, steps: number, z: number) => {
    const path: Point[] = [];
    for (let i = 0; i <= steps; i++) { const a = i / steps * Math.PI * 2; path.push([Math.cos(a) * radius, Math.sin(a) * radius, z]); }
    strip(path);
  };
  const done = () => {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(points, 3));
    geometry.computeBoundingSphere();
    return geometry;
  };
  return { seg, strip, ring, done };
}

export function createSkeletonHeadGeometry(): BufferGeometry {
  const { seg, strip, ring, done } = segments();
  const petal = (angle: number, reach: number, halfWidth: number, curl: number) => {
    const edge = (t: number, s: number): Point => {
      const w = halfWidth * Math.pow(Math.sin(Math.PI * Math.min(1, t * .9 + .1)), .72);
      const x = s * w, y = .075 + reach * t;
      return [Math.cos(angle) * x - Math.sin(angle) * y, Math.sin(angle) * x + Math.cos(angle) * y, curl * (t * t + s * s * .35)];
    };
    const steps = 13;
    const left: Point[] = [], right: Point[] = [], mid: Point[] = [];
    for (let i = 0; i <= steps; i++) { const t = i / steps; left.push(edge(t, -1)); right.push(edge(t, 1)); mid.push(edge(t, 0)); }
    strip(left); strip(right); strip(mid);
    seg(left[0], right[0]);
    // Side veins branch forward off the midrib, the way a pressed petal dries.
    for (const k of [3, 6, 9]) { seg(mid[k], left[k + 3]); seg(mid[k], right[k + 3]); }
  };
  for (let i = 0; i < 8; i++) petal(i * Math.PI * 2 / 8, 1.05, .3, .26);
  for (let i = 0; i < 6; i++) petal(i * Math.PI * 2 / 6 + .42, .62, .2, .34);
  ring(.17, 24, .17); ring(.09, 18, .21);
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * Math.PI * 2;
    seg([Math.cos(a) * .09, Math.sin(a) * .09, .21], [Math.cos(a) * .17, Math.sin(a) * .17, .17]);
  }
  return done();
}

export function createSkeletonStemGeometry(height: number, lean: number): BufferGeometry {
  const { seg, strip, done } = segments();
  const spine = (t: number): Point => [lean * t * t, height * t, lean * .4 * t * t * t];
  const path: Point[] = [];
  for (let i = 0; i <= 24; i++) path.push(spine(i / 24));
  strip(path);
  for (let leaf = 0; leaf < 2; leaf++) {
    const side = leaf === 0 ? -1 : 1, base = spine(.34 + leaf * .22), reach = .34 - leaf * .07;
    const edge = (t: number, s: number): Point => {
      const w = .085 * Math.sin(Math.PI * Math.min(1, t * .9 + .1));
      return [base[0] + side * reach * t, base[1] + reach * t * .62 + s * w, base[2] + s * w * .4];
    };
    const steps = 9, left: Point[] = [], right: Point[] = [], mid: Point[] = [];
    for (let i = 0; i <= steps; i++) { const t = i / steps; left.push(edge(t, -1)); right.push(edge(t, 1)); mid.push(edge(t, 0)); }
    strip(left); strip(right); strip(mid);
    seg(left[0], right[0]);
    for (const k of [2, 5]) { seg(mid[k], left[k + 2]); seg(mid[k], right[k + 2]); }
  }
  return done();
}

/** Where each message flower stands. Index 0 is the host, nearest the camera. */
export function flowerPosition(index: number, mobile: boolean): Vector3 {
  const desktop: [number, number][] = [[-1.1, 1.9], [2.2, .7], [-3.1, -.4], [3.9, -1.9], [-4.9, -2.6], [.9, -3.2], [-1.7, -4.4], [5.3, -4.9]];
  const small: [number, number][] = [[-.7, 1.9], [1.6, .3], [-2, -1.5], [2.2, -3.2]];
  const spots = mobile ? small : desktop;
  const spot = spots[index % spots.length];
  return new Vector3(spot[0], 0, spot[1]);
}
