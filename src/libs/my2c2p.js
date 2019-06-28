function BigInteger(a, b, c) {
  null != a && ("number" == typeof a ? this.fromNumber(a, b, c) : null == b && "string" != typeof a ? this.fromString(a, 256) : this.fromString(a, b))
}

function nbi() {
  return new BigInteger(null)
}

function am1(a, b, c, d, e, f) {
  for (; --f >= 0;) {
    var g = b * this[a++] + c[d] + e;
    e = Math.floor(g / 67108864), c[d++] = 67108863 & g
  }
  return e
}

function am2(a, b, c, d, e, f) {
  for (var g = 32767 & b, h = b >> 15; --f >= 0;) {
    var i = 32767 & this[a],
      j = this[a++] >> 15,
      k = h * i + j * g;
    i = g * i + ((32767 & k) << 15) + c[d] + (1073741823 & e), e = (i >>> 30) + (k >>> 15) + h * j + (e >>> 30), c[d++] = 1073741823 & i
  }
  return e
}

function am3(a, b, c, d, e, f) {
  for (var g = 16383 & b, h = b >> 14; --f >= 0;) {
    var i = 16383 & this[a],
      j = this[a++] >> 14,
      k = h * i + j * g;
    i = g * i + ((16383 & k) << 14) + c[d] + e, e = (i >> 28) + (k >> 14) + h * j, c[d++] = 268435455 & i
  }
  return e
}

function int2char(a) {
  return BI_RM.charAt(a)
}

function intAt(a, b) {
  var c = BI_RC[a.charCodeAt(b)];
  return null == c ? -1 : c
}

function bnpCopyTo(a) {
  for (var b = this.t - 1; b >= 0; --b) a[b] = this[b];
  a.t = this.t, a.s = this.s
}

function bnpFromInt(a) {
  this.t = 1, this.s = a < 0 ? -1 : 0, a > 0 ? this[0] = a : a < -1 ? this[0] = a + this.DV : this.t = 0
}

function nbv(a) {
  var b = nbi();
  return b.fromInt(a), b
}

function bnpFromString(a, b) {
  var c;
  if (16 == b) c = 4;
  else if (8 == b) c = 3;
  else if (256 == b) c = 8;
  else if (2 == b) c = 1;
  else if (32 == b) c = 5;
  else {
    if (4 != b) return void this.fromRadix(a, b);
    c = 2
  }
  this.t = 0, this.s = 0;
  for (var d = a.length, e = !1, f = 0; --d >= 0;) {
    var g = 8 == c ? 255 & a[d] : intAt(a, d);
    g < 0 ? "-" == a.charAt(d) && (e = !0) : (e = !1, 0 == f ? this[this.t++] = g : f + c > this.DB ? (this[this.t - 1] |= (g & (1 << this.DB - f) - 1) << f, this[this.t++] = g >> this.DB - f) : this[this.t - 1] |= g << f, f += c, f >= this.DB && (f -= this.DB))
  }
  8 == c && 0 != (128 & a[0]) && (this.s = -1, f > 0 && (this[this.t - 1] |= (1 << this.DB - f) - 1 << f)), this.clamp(), e && BigInteger.ZERO.subTo(this, this)
}

function bnpClamp() {
  for (var a = this.s & this.DM; this.t > 0 && this[this.t - 1] == a;)--this.t
}

function bnToString(a) {
  if (this.s < 0) return "-" + this.negate().toString(a);
  var b;
  if (16 == a) b = 4;
  else if (8 == a) b = 3;
  else if (2 == a) b = 1;
  else if (32 == a) b = 5;
  else {
    if (4 != a) return this.toRadix(a);
    b = 2
  }
  var d, c = (1 << b) - 1,
    e = !1,
    f = "",
    g = this.t,
    h = this.DB - g * this.DB % b;
  if (g-- > 0)
    for (h < this.DB && (d = this[g] >> h) > 0 && (e = !0, f = int2char(d)); g >= 0;) h < b ? (d = (this[g] & (1 << h) - 1) << b - h, d |= this[--g] >> (h += this.DB - b)) : (d = this[g] >> (h -= b) & c, h <= 0 && (h += this.DB, --g)), d > 0 && (e = !0), e && (f += int2char(d));
  return e ? f : "0"
}

function bnNegate() {
  var a = nbi();
  return BigInteger.ZERO.subTo(this, a), a
}

function bnAbs() {
  return this.s < 0 ? this.negate() : this
}

function bnCompareTo(a) {
  var b = this.s - a.s;
  if (0 != b) return b;
  var c = this.t;
  if (b = c - a.t, 0 != b) return this.s < 0 ? -b : b;
  for (; --c >= 0;)
    if (0 != (b = this[c] - a[c])) return b;
  return 0
}

function nbits(a) {
  var c, b = 1;
  return 0 != (c = a >>> 16) && (a = c, b += 16), 0 != (c = a >> 8) && (a = c, b += 8), 0 != (c = a >> 4) && (a = c, b += 4), 0 != (c = a >> 2) && (a = c, b += 2), 0 != (c = a >> 1) && (a = c, b += 1), b
}

function bnBitLength() {
  return this.t <= 0 ? 0 : this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ this.s & this.DM)
}

function bnpDLShiftTo(a, b) {
  var c;
  for (c = this.t - 1; c >= 0; --c) b[c + a] = this[c];
  for (c = a - 1; c >= 0; --c) b[c] = 0;
  b.t = this.t + a, b.s = this.s
}

function bnpDRShiftTo(a, b) {
  for (var c = a; c < this.t; ++c) b[c - a] = this[c];
  b.t = Math.max(this.t - a, 0), b.s = this.s
}

function bnpLShiftTo(a, b) {
  var h, c = a % this.DB,
    d = this.DB - c,
    e = (1 << d) - 1,
    f = Math.floor(a / this.DB),
    g = this.s << c & this.DM;
  for (h = this.t - 1; h >= 0; --h) b[h + f + 1] = this[h] >> d | g, g = (this[h] & e) << c;
  for (h = f - 1; h >= 0; --h) b[h] = 0;
  b[f] = g, b.t = this.t + f + 1, b.s = this.s, b.clamp()
}

function bnpRShiftTo(a, b) {
  b.s = this.s;
  var c = Math.floor(a / this.DB);
  if (c >= this.t) return void (b.t = 0);
  var d = a % this.DB,
    e = this.DB - d,
    f = (1 << d) - 1;
  b[0] = this[c] >> d;
  for (var g = c + 1; g < this.t; ++g) b[g - c - 1] |= (this[g] & f) << e, b[g - c] = this[g] >> d;
  d > 0 && (b[this.t - c - 1] |= (this.s & f) << e), b.t = this.t - c, b.clamp()
}

function bnpSubTo(a, b) {
  for (var c = 0, d = 0, e = Math.min(a.t, this.t); c < e;) d += this[c] - a[c], b[c++] = d & this.DM, d >>= this.DB;
  if (a.t < this.t) {
    for (d -= a.s; c < this.t;) d += this[c], b[c++] = d & this.DM, d >>= this.DB;
    d += this.s
  } else {
    for (d += this.s; c < a.t;) d -= a[c], b[c++] = d & this.DM, d >>= this.DB;
    d -= a.s
  }
  b.s = d < 0 ? -1 : 0, d < -1 ? b[c++] = this.DV + d : d > 0 && (b[c++] = d), b.t = c, b.clamp()
}

function bnpMultiplyTo(a, b) {
  var c = this.abs(),
    d = a.abs(),
    e = c.t;
  for (b.t = e + d.t; --e >= 0;) b[e] = 0;
  for (e = 0; e < d.t; ++e) b[e + c.t] = c.am(0, d[e], b, e, 0, c.t);
  b.s = 0, b.clamp(), this.s != a.s && BigInteger.ZERO.subTo(b, b)
}

function bnpSquareTo(a) {
  for (var b = this.abs(), c = a.t = 2 * b.t; --c >= 0;) a[c] = 0;
  for (c = 0; c < b.t - 1; ++c) {
    var d = b.am(c, b[c], a, 2 * c, 0, 1);
    (a[c + b.t] += b.am(c + 1, 2 * b[c], a, 2 * c + 1, d, b.t - c - 1)) >= b.DV && (a[c + b.t] -= b.DV, a[c + b.t + 1] = 1)
  }
  a.t > 0 && (a[a.t - 1] += b.am(c, b[c], a, 2 * c, 0, 1)), a.s = 0, a.clamp()
}

function bnpDivRemTo(a, b, c) {
  var d = a.abs();
  if (!(d.t <= 0)) {
    var e = this.abs();
    if (e.t < d.t) return null != b && b.fromInt(0), void (null != c && this.copyTo(c));
    null == c && (c = nbi());
    var f = nbi(),
      g = this.s,
      h = a.s,
      i = this.DB - nbits(d[d.t - 1]);
    i > 0 ? (d.lShiftTo(i, f), e.lShiftTo(i, c)) : (d.copyTo(f), e.copyTo(c));
    var j = f.t,
      k = f[j - 1];
    if (0 != k) {
      var l = k * (1 << this.F1) + (j > 1 ? f[j - 2] >> this.F2 : 0),
        m = this.FV / l,
        n = (1 << this.F1) / l,
        o = 1 << this.F2,
        p = c.t,
        q = p - j,
        r = null == b ? nbi() : b;
      for (f.dlShiftTo(q, r), c.compareTo(r) >= 0 && (c[c.t++] = 1, c.subTo(r, c)), BigInteger.ONE.dlShiftTo(j, r), r.subTo(f, f); f.t < j;) f[f.t++] = 0;
      for (; --q >= 0;) {
        var s = c[--p] == k ? this.DM : Math.floor(c[p] * m + (c[p - 1] + o) * n);
        if ((c[p] += f.am(0, s, c, q, 0, j)) < s)
          for (f.dlShiftTo(q, r), c.subTo(r, c); c[p] < --s;) c.subTo(r, c)
      }
      null != b && (c.drShiftTo(j, b), g != h && BigInteger.ZERO.subTo(b, b)), c.t = j, c.clamp(), i > 0 && c.rShiftTo(i, c), g < 0 && BigInteger.ZERO.subTo(c, c)
    }
  }
}

function bnMod(a) {
  var b = nbi();
  return this.abs().divRemTo(a, null, b), this.s < 0 && b.compareTo(BigInteger.ZERO) > 0 && a.subTo(b, b), b
}

function Classic(a) {
  this.m = a
}

function cConvert(a) {
  return a.s < 0 || a.compareTo(this.m) >= 0 ? a.mod(this.m) : a
}

function cRevert(a) {
  return a
}

function cReduce(a) {
  a.divRemTo(this.m, null, a)
}

function cMulTo(a, b, c) {
  a.multiplyTo(b, c), this.reduce(c)
}

function cSqrTo(a, b) {
  a.squareTo(b), this.reduce(b)
}

function bnpInvDigit() {
  if (this.t < 1) return 0;
  var a = this[0];
  if (0 == (1 & a)) return 0;
  var b = 3 & a;
  return b = b * (2 - (15 & a) * b) & 15, b = b * (2 - (255 & a) * b) & 255, b = b * (2 - ((65535 & a) * b & 65535)) & 65535, b = b * (2 - a * b % this.DV) % this.DV, b > 0 ? this.DV - b : -b
}

function Montgomery(a) {
  this.m = a, this.mp = a.invDigit(), this.mpl = 32767 & this.mp, this.mph = this.mp >> 15, this.um = (1 << a.DB - 15) - 1, this.mt2 = 2 * a.t
}

function montConvert(a) {
  var b = nbi();
  return a.abs().dlShiftTo(this.m.t, b), b.divRemTo(this.m, null, b), a.s < 0 && b.compareTo(BigInteger.ZERO) > 0 && this.m.subTo(b, b), b
}

function montRevert(a) {
  var b = nbi();
  return a.copyTo(b), this.reduce(b), b
}

function montReduce(a) {
  for (; a.t <= this.mt2;) a[a.t++] = 0;
  for (var b = 0; b < this.m.t; ++b) {
    var c = 32767 & a[b],
      d = c * this.mpl + ((c * this.mph + (a[b] >> 15) * this.mpl & this.um) << 15) & a.DM;
    for (c = b + this.m.t, a[c] += this.m.am(0, d, a, b, 0, this.m.t); a[c] >= a.DV;) a[c] -= a.DV, a[++c]++
  }
  a.clamp(), a.drShiftTo(this.m.t, a), a.compareTo(this.m) >= 0 && a.subTo(this.m, a)
}

function montSqrTo(a, b) {
  a.squareTo(b), this.reduce(b)
}

function montMulTo(a, b, c) {
  a.multiplyTo(b, c), this.reduce(c)
}

function bnpIsEven() {
  return 0 == (this.t > 0 ? 1 & this[0] : this.s)
}

function bnpExp(a, b) {
  if (a > 4294967295 || a < 1) return BigInteger.ONE;
  var c = nbi(),
    d = nbi(),
    e = b.convert(this),
    f = nbits(a) - 1;
  for (e.copyTo(c); --f >= 0;)
    if (b.sqrTo(c, d), (a & 1 << f) > 0) b.mulTo(d, e, c);
    else {
      var g = c;
      c = d, d = g
    } return b.revert(c)
}

function bnModPowInt(a, b) {
  var c;
  return c = a < 256 || b.isEven() ? new Classic(b) : new Montgomery(b), this.exp(a, c)
}

function Arcfour() {
  this.i = 0, this.j = 0, this.S = new Array
}

function ARC4init(a) {
  var b, c, d;
  for (b = 0; b < 256; ++b) this.S[b] = b;
  for (c = 0, b = 0; b < 256; ++b) c = c + this.S[b] + a[b % a.length] & 255, d = this.S[b], this.S[b] = this.S[c], this.S[c] = d;
  this.i = 0, this.j = 0
}

function ARC4next() {
  var a;
  return this.i = this.i + 1 & 255, this.j = this.j + this.S[this.i] & 255, a = this.S[this.i], this.S[this.i] = this.S[this.j], this.S[this.j] = a, this.S[a + this.S[this.i] & 255]
}

function prng_newstate() {
  return new Arcfour
}

function rng_seed_int(a) {
  rng_pool[rng_pptr++] ^= 255 & a, rng_pool[rng_pptr++] ^= a >> 8 & 255, rng_pool[rng_pptr++] ^= a >> 16 & 255, rng_pool[rng_pptr++] ^= a >> 24 & 255, rng_pptr >= rng_psize && (rng_pptr -= rng_psize)
}

function rng_seed_time() {
  rng_seed_int((new Date).getTime())
}

function rng_get_byte() {
  if (null == rng_state) {
    for (rng_seed_time(), rng_state = prng_newstate(), rng_state.init(rng_pool), rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr) rng_pool[rng_pptr] = 0;
    rng_pptr = 0
  }
  return rng_state.next()
}

function rng_get_bytes(a) {
  var b;
  for (b = 0; b < a.length; ++b) a[b] = rng_get_byte()
}

function SecureRandom() { }

function parseBigInt(a, b) {
  return new BigInteger(a, b)
}

function linebrk(a, b) {
  for (var c = "", d = 0; d + b < a.length;) c += a.substring(d, d + b) + "\n", d += b;
  return c + a.substring(d, a.length)
}

function byte2Hex(a) {
  return a < 16 ? "0" + a.toString(16) : a.toString(16)
}

function pkcs1pad2(a, b) {
  if (b < a.length + 11) return alert("Message too long for RSA"), null;
  for (var c = new Array, d = a.length - 1; d >= 0 && b > 0;) {
    var e = a.charCodeAt(d--);
    e < 128 ? c[--b] = e : e > 127 && e < 2048 ? (c[--b] = 63 & e | 128, c[--b] = e >> 6 | 192) : (c[--b] = 63 & e | 128, c[--b] = e >> 6 & 63 | 128, c[--b] = e >> 12 | 224)
  }
  c[--b] = 0;
  for (var f = new SecureRandom, g = new Array; b > 2;) {
    for (g[0] = 0; 0 == g[0];) f.nextBytes(g);
    c[--b] = g[0]
  }
  return c[--b] = 2, c[--b] = 0, new BigInteger(c)
}

function RSAKey() {
  this.n = null, this.e = 0, this.d = null, this.p = null, this.q = null, this.dmp1 = null, this.dmq1 = null, this.coeff = null
}

function RSASetPublic(a, b) {
  null != a && null != b && a.length > 0 && b.length > 0 ? (this.n = parseBigInt(a, 16), this.e = parseInt(b, 16)) : alert("Invalid RSA public key")
}

function RSADoPublic(a) {
  return a.modPowInt(this.e, this.n)
}

function RSAEncrypt(a) {
  var b = pkcs1pad2(a, this.n.bitLength() + 7 >> 3);
  if (null == b) return null;
  var c = this.doPublic(b);
  if (null == c) return null;
  var d = c.toString(16);
  return 0 == (1 & d.length) ? d : "0" + d
}

function hex2b64(a) {
  var b, c, d = "";
  for (b = 0; b + 3 <= a.length; b += 3) c = parseInt(a.substring(b, b + 3), 16), d += b64map.charAt(c >> 6) + b64map.charAt(63 & c);
  for (b + 1 == a.length ? (c = parseInt(a.substring(b, b + 1), 16), d += b64map.charAt(c << 2)) : b + 2 == a.length && (c = parseInt(a.substring(b, b + 2), 16), d += b64map.charAt(c >> 2) + b64map.charAt((3 & c) << 4));
    (3 & d.length) > 0;) d += b64padchar;
  return d
}

function b64tohex(a) {
  var c, e, b = "",
    d = 0;
  for (c = 0; c < a.length && a.charAt(c) != b64padchar; ++c) v = b64map.indexOf(a.charAt(c)), v < 0 || (0 == d ? (b += int2char(v >> 2), e = 3 & v, d = 1) : 1 == d ? (b += int2char(e << 2 | v >> 4), e = 15 & v, d = 2) : 2 == d ? (b += int2char(e), b += int2char(v >> 2), e = 3 & v, d = 3) : (b += int2char(e << 2 | v >> 4), b += int2char(15 & v), d = 0));
  return 1 == d && (b += int2char(e << 2)), b
}

function b64toBA(a) {
  var c, b = b64tohex(a),
    d = new Array;
  for (c = 0; 2 * c < b.length; ++c) d[c] = parseInt(b.substring(2 * c, 2 * c + 2), 16);
  return d
}
var dbits, canary = 0xdeadbeefcafe,
  j_lm = 15715070 == (16777215 & canary);
j_lm && "Microsoft Internet Explorer" == navigator.appName ? (BigInteger.prototype.am = am2, dbits = 30) : j_lm && "Netscape" != navigator.appName ? (BigInteger.prototype.am = am1, dbits = 26) : (BigInteger.prototype.am = am3, dbits = 28), BigInteger.prototype.DB = dbits, BigInteger.prototype.DM = (1 << dbits) - 1, BigInteger.prototype.DV = 1 << dbits;
var BI_FP = 52;
BigInteger.prototype.FV = Math.pow(2, BI_FP), BigInteger.prototype.F1 = BI_FP - dbits, BigInteger.prototype.F2 = 2 * dbits - BI_FP;
var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz",
  BI_RC = new Array,
  rr, vv;
for (rr = "0".charCodeAt(0), vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
for (rr = "a".charCodeAt(0), vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
for (rr = "A".charCodeAt(0), vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
Classic.prototype.convert = cConvert, Classic.prototype.revert = cRevert, Classic.prototype.reduce = cReduce, Classic.prototype.mulTo = cMulTo, Classic.prototype.sqrTo = cSqrTo, Montgomery.prototype.convert = montConvert, Montgomery.prototype.revert = montRevert, Montgomery.prototype.reduce = montReduce, Montgomery.prototype.mulTo = montMulTo, Montgomery.prototype.sqrTo = montSqrTo, BigInteger.prototype.copyTo = bnpCopyTo, BigInteger.prototype.fromInt = bnpFromInt, BigInteger.prototype.fromString = bnpFromString, BigInteger.prototype.clamp = bnpClamp, BigInteger.prototype.dlShiftTo = bnpDLShiftTo, BigInteger.prototype.drShiftTo = bnpDRShiftTo, BigInteger.prototype.lShiftTo = bnpLShiftTo, BigInteger.prototype.rShiftTo = bnpRShiftTo, BigInteger.prototype.subTo = bnpSubTo, BigInteger.prototype.multiplyTo = bnpMultiplyTo, BigInteger.prototype.squareTo = bnpSquareTo, BigInteger.prototype.divRemTo = bnpDivRemTo, BigInteger.prototype.invDigit = bnpInvDigit, BigInteger.prototype.isEven = bnpIsEven, BigInteger.prototype.exp = bnpExp, BigInteger.prototype.toString = bnToString, BigInteger.prototype.negate = bnNegate, BigInteger.prototype.abs = bnAbs, BigInteger.prototype.compareTo = bnCompareTo, BigInteger.prototype.bitLength = bnBitLength, BigInteger.prototype.mod = bnMod, BigInteger.prototype.modPowInt = bnModPowInt, BigInteger.ZERO = nbv(0), BigInteger.ONE = nbv(1), Arcfour.prototype.init = ARC4init, Arcfour.prototype.next = ARC4next;
var rng_psize = 256,
  rng_state, rng_pool, rng_pptr;
if (null == rng_pool) {
  rng_pool = new Array, rng_pptr = 0;
  var t;
  if (window.crypto && window.crypto.getRandomValues) {
    var ua = new Uint8Array(32);
    for (window.crypto.getRandomValues(ua), t = 0; t < 32; ++t) rng_pool[rng_pptr++] = ua[t]
  }
  if ("Netscape" == navigator.appName && navigator.appVersion < "5" && window.crypto) {
    var z = window.crypto.random(32);
    for (t = 0; t < z.length; ++t) rng_pool[rng_pptr++] = 255 & z.charCodeAt(t)
  }
  for (; rng_pptr < rng_psize;) t = Math.floor(65536 * Math.random()), rng_pool[rng_pptr++] = t >>> 8, rng_pool[rng_pptr++] = 255 & t;
  rng_pptr = 0, rng_seed_time()
}
SecureRandom.prototype.nextBytes = rng_get_bytes, RSAKey.prototype.doPublic = RSADoPublic, RSAKey.prototype.setPublic = RSASetPublic, RSAKey.prototype.encrypt = RSAEncrypt;
var b64map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
  b64padchar = "=";
! function (a) {
  "use strict";

  function d(a, c) {
    return a.length > c && (a = a.substring(0, c) + b), a
  }

  function e(a, b) {
    a instanceof e ? (this.enc = a.enc, this.pos = a.pos) : (this.enc = a, this.pos = b)
  }

  function f(a, b, c, d, e) {
    if (!(d instanceof g)) throw "Invalid tag value.";
    this.stream = a, this.header = b, this.length = c, this.tag = d, this.sub = e
  }

  function g(a) {
    var b = a.get();
    if (this.tagClass = b >> 6, this.tagConstructed = 0 !== (32 & b), this.tagNumber = 31 & b, 31 == this.tagNumber) {
      var c = 0;
      this.tagNumber = 0;
      do {
        if (b = a.get(), c += 7, c > 53) throw "Tag numbers over 53 bits not supported at position " + (a.pos - 1);
        this.tagNumber = 128 * this.tagNumber + (127 & b)
      } while (128 & b)
    }
  }
  var b = "â€¦",
    c = /^((?:1[89]|2\d)?\d\d)(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([01]\d|2[0-3])(?:([0-5]\d)(?:([0-5]\d)(?:[.,](\d{1,3}))?)?)?(Z|[-+](?:[0]\d|1[0-2])([0-5]\d)?)?$/;
  e.prototype.get = function (b) {
    if (b === a && (b = this.pos++), b >= this.enc.length) throw "Requesting byte offset " + b + " on a stream of length " + this.enc.length;
    return this.enc[b]
  }, e.prototype.hexDigits = "0123456789ABCDEF", e.prototype.hexByte = function (a) {
    return this.hexDigits.charAt(a >> 4 & 15) + this.hexDigits.charAt(15 & a)
  }, e.prototype.hexDump = function (a, b, c) {
    for (var d = "", e = a; e < b; ++e)
      if (d += this.hexByte(this.get(e)), c !== !0) switch (15 & e) {
        case 7:
          d += "  ";
          break;
        case 15:
          d += "\n";
          break;
        default:
          d += " "
      }
    return d
  }, e.prototype.isASCII = function (a, b) {
    for (var c = a; c < b; ++c) {
      var d = this.get(c);
      if (d < 32 || d > 176) return !1
    }
    return !0
  }, e.prototype.parseStringISO = function (a, b) {
    for (var c = "", d = a; d < b; ++d) c += String.fromCharCode(this.get(d));
    return c
  }, e.prototype.parseStringUTF = function (a, b) {
    for (var c = "", d = a; d < b;) {
      var e = this.get(d++);
      c += e < 128 ? String.fromCharCode(e) : e > 191 && e < 224 ? String.fromCharCode((31 & e) << 6 | 63 & this.get(d++)) : String.fromCharCode((15 & e) << 12 | (63 & this.get(d++)) << 6 | 63 & this.get(d++))
    }
    return c
  }, e.prototype.parseStringBMP = function (a, b) {
    for (var d, e, c = "", f = a; f < b;) d = this.get(f++), e = this.get(f++), c += String.fromCharCode(d << 8 | e);
    return c
  }, e.prototype.parseTime = function (a, b, d) {
    var e = this.parseStringISO(a, b),
      f = c.exec(e);
    return f ? (d && (f[1] = +f[1], f[1] += f[1] < 70 ? 2e3 : 1900), e = f[1] + "-" + f[2] + "-" + f[3] + " " + f[4], f[5] && (e += ":" + f[5], f[6] && (e += ":" + f[6], f[7] && (e += "." + f[7]))), f[8] && (e += " UTC", "Z" != f[8] && (e += f[8], f[9] && (e += ":" + f[9]))), e) : "Unrecognized time: " + e
  }, e.prototype.parseInteger = function (a, b) {
    var c = b - a;
    if (c > 6) {
      c <<= 3;
      var d = this.get(a);
      if (0 === d) c -= 8;
      else
        for (; d < 128;) d <<= 1, --c;
      return "(" + c + " bit)"
    }
    for (var e = 0, f = a; f < b; ++f) e = 256 * e + this.get(f);
    return e
  }, e.prototype.parseBitString = function (a, b, c) {
    for (var e = this.get(a), f = (b - a - 1 << 3) - e, g = "(" + f + " bit)\n", h = "", i = e, j = b - 1; j > a; --j) {
      for (var k = this.get(j), l = i; l < 8; ++l) h += k >> l & 1 ? "1" : "0";
      if (i = 0, h.length > c) return g + d(h, c)
    }
    return g + h
  }, e.prototype.parseOctetString = function (a, c, e) {
    if (this.isASCII(a, c)) return d(this.parseStringISO(a, c), e);
    var f = c - a,
      g = "(" + f + " byte)\n";
    e /= 2, f > e && (c = a + e);
    for (var h = a; h < c; ++h) g += this.hexByte(this.get(h));
    return f > e && (g += b), g
  }, e.prototype.parseOID = function (a, b, c) {
    for (var e = "", f = 0, g = 0, h = a; h < b; ++h) {
      var i = this.get(h);
      if (f = 128 * f + (127 & i), g += 7, !(128 & i)) {
        if ("" === e) {
          var j = f < 80 ? f < 40 ? 0 : 1 : 2;
          e = j + "." + (f - 40 * j)
        } else e += "." + (g > 53 ? "bigint" : f);
        if (f = g = 0, e.length > c) return d(e, c)
      }
    }
    return g > 0 && (e += ".incomplete"), e
  }, f.prototype.typeName = function () {
    switch (this.tag.tagClass) {
      case 0:
        switch (this.tag.tagNumber) {
          case 0:
            return "EOC";
          case 1:
            return "BOOLEAN";
          case 2:
            return "INTEGER";
          case 3:
            return "BIT_STRING";
          case 4:
            return "OCTET_STRING";
          case 5:
            return "NULL";
          case 6:
            return "OBJECT_IDENTIFIER";
          case 7:
            return "ObjectDescriptor";
          case 8:
            return "EXTERNAL";
          case 9:
            return "REAL";
          case 10:
            return "ENUMERATED";
          case 11:
            return "EMBEDDED_PDV";
          case 12:
            return "UTF8String";
          case 16:
            return "SEQUENCE";
          case 17:
            return "SET";
          case 18:
            return "NumericString";
          case 19:
            return "PrintableString";
          case 20:
            return "TeletexString";
          case 21:
            return "VideotexString";
          case 22:
            return "IA5String";
          case 23:
            return "UTCTime";
          case 24:
            return "GeneralizedTime";
          case 25:
            return "GraphicString";
          case 26:
            return "VisibleString";
          case 27:
            return "GeneralString";
          case 28:
            return "UniversalString";
          case 30:
            return "BMPString";
          default:
            return "Universal_" + this.tag.tagNumber.toString(16)
        }
      case 1:
        return "Application_" + this.tag.tagNumber.toString(16);
      case 2:
        return "[" + this.tag.tagNumber + "]";
      case 3:
        return "Private_" + this.tag.tagNumber.toString(16)
    }
  }, f.prototype.content = function (b) {
    if (this.tag === a) return null;
    b === a && (b = 1 / 0);
    var c = this.posContent(),
      e = Math.abs(this.length);
    if (!this.tag.isUniversal()) return null !== this.sub ? "(" + this.sub.length + " elem)" : this.stream.parseOctetString(c, c + e, b);
    switch (this.tag.tagNumber) {
      case 1:
        return 0 === this.stream.get(c) ? "false" : "true";
      case 2:
        return this.stream.parseInteger(c, c + e);
      case 3:
        return this.sub ? "(" + this.sub.length + " elem)" : this.stream.parseBitString(c, c + e, b);
      case 4:
        return this.sub ? "(" + this.sub.length + " elem)" : this.stream.parseOctetString(c, c + e, b);
      case 6:
        return this.stream.parseOID(c, c + e, b);
      case 16:
      case 17:
        return "(" + this.sub.length + " elem)";
      case 12:
        return d(this.stream.parseStringUTF(c, c + e), b);
      case 18:
      case 19:
      case 20:
      case 21:
      case 22:
      case 26:
        return d(this.stream.parseStringISO(c, c + e), b);
      case 30:
        return d(this.stream.parseStringBMP(c, c + e), b);
      case 23:
      case 24:
        return this.stream.parseTime(c, c + e, 23 == this.tag.tagNumber)
    }
    return null
  }, f.prototype.toString = function () {
    return this.typeName() + "@" + this.stream.pos + "[header:" + this.header + ",length:" + this.length + ",sub:" + (null === this.sub ? "null" : this.sub.length) + "]"
  }, f.prototype.toPrettyString = function (b) {
    b === a && (b = "");
    var c = b + this.typeName() + " @" + this.stream.pos;
    if (this.length >= 0 && (c += "+"), c += this.length, this.tag.tagConstructed ? c += " (constructed)" : !this.tag.isUniversal() || 3 != this.tag.tagNumber && 4 != this.tag.tagNumber || null === this.sub || (c += " (encapsulates)"), c += "\n", null !== this.sub) {
      b += "  ";
      for (var d = 0, e = this.sub.length; d < e; ++d) c += this.sub[d].toPrettyString(b)
    }
    return c
  }, f.prototype.posStart = function () {
    return this.stream.pos
  }, f.prototype.posContent = function () {
    return this.stream.pos + this.header
  }, f.prototype.posEnd = function () {
    return this.stream.pos + this.header + Math.abs(this.length)
  }, f.prototype.toHexString = function (a) {
    return this.stream.hexDump(this.posStart(), this.posEnd(), !0)
  }, f.decodeLength = function (a) {
    var b = a.get(),
      c = 127 & b;
    if (c == b) return c;
    if (c > 6) throw "Length over 48 bits not supported at position " + (a.pos - 1);
    if (0 === c) return null;
    b = 0;
    for (var d = 0; d < c; ++d) b = 256 * b + a.get();
    return b
  }, g.prototype.isUniversal = function () {
    return 0 === this.tagClass
  }, g.prototype.isEOC = function () {
    return 0 === this.tagClass && 0 === this.tagNumber
  }, f.decode = function (a) {
    a instanceof e || (a = new e(a, 0));
    var b = new e(a),
      c = new g(a),
      d = f.decodeLength(a),
      h = a.pos,
      i = h - b.pos,
      j = null,
      k = function () {
        if (j = [], null !== d) {
          for (var b = h + d; a.pos < b;) j[j.length] = f.decode(a);
          if (a.pos != b) throw "Content size is not correct for container starting at offset " + h
        } else try {
          for (; ;) {
            var c = f.decode(a);
            if (c.tag.isEOC()) break;
            j[j.length] = c
          }
          d = h - a.pos
        } catch (a) {
          throw "Exception while decoding undefined length content: " + a
        }
      };
    if (c.tagConstructed) k();
    else if (c.isUniversal() && (3 == c.tagNumber || 4 == c.tagNumber)) {
      c.isUniversal() && 3 == c.tagNumber && a.get();
      try {
        k();
        for (var l = 0; l < j.length; ++l)
          if (j[l].tag.isEOC()) throw "EOC is not supposed to be actual content."
      } catch (a) {
        j = null
      }
    }
    if (null === j) {
      if (null === d) throw "We can't skip over an invalid tag with undefined length at offset " + h;
      a.pos = h + Math.abs(d)
    }
    return new f(b, i, d, c, j)
  }, "undefined" != typeof module ? module.exports = f : window.ASN1 = f
}(),
  function (a, b) {
    "object" == typeof exports ? module.exports = b() : "function" == typeof define && define.amd ? define(b) : a.GibberishAES = b()
  }(this, function () {
    "use strict";
    var a = 14,
      b = 8,
      c = !1,
      d = function (a) {
        try {
          return unescape(encodeURIComponent(a))
        } catch (a) {
          throw "Error on UTF-8 encode"
        }
      },
      e = function (a) {
        try {
          return decodeURIComponent(escape(a))
        } catch (a) {
          throw "Bad Key"
        }
      },
      f = function (a) {
        var c, d, b = [];
        for (a.length < 16 && (c = 16 - a.length, b = [c, c, c, c, c, c, c, c, c, c, c, c, c, c, c, c]), d = 0; d < a.length; d++) b[d] = a[d];
        return b
      },
      g = function (a, b) {
        var d, e, c = "";
        if (b) {
          if (d = a[15], d > 16) throw "Decryption error: Maybe bad key";
          if (16 === d) return "";
          for (e = 0; e < 16 - d; e++) c += String.fromCharCode(a[e])
        } else
          for (e = 0; e < 16; e++) c += String.fromCharCode(a[e]);
        return c
      },
      h = function (a) {
        var c, b = "";
        for (c = 0; c < a.length; c++) b += (a[c] < 16 ? "0" : "") + a[c].toString(16);
        return b
      },
      i = function (a) {
        var b = [];
        return a.replace(/(..)/g, function (a) {
          b.push(parseInt(a, 16))
        }), b
      },
      j = function (a, b) {
        var e, c = [];
        for (b || (a = d(a)), e = 0; e < a.length; e++) c[e] = a.charCodeAt(e);
        return c
      },
      k = function (c) {
        switch (c) {
          case 128:
            a = 10, b = 4;
            break;
          case 192:
            a = 12, b = 6;
            break;
          case 256:
            a = 14, b = 8;
            break;
          default:
            throw "Invalid Key Size Specified:" + c
        }
      },
      l = function (a) {
        var c, b = [];
        for (c = 0; c < a; c++) b = b.concat(Math.floor(256 * Math.random()));
        return b
      },
      m = function (c, d) {
        var k, e = a >= 12 ? 3 : 2,
          f = [],
          g = [],
          h = [],
          i = [],
          j = c.concat(d);
        for (h[0] = O(j), i = h[0], k = 1; k < e; k++) h[k] = O(h[k - 1].concat(j)), i = i.concat(h[k]);
        return f = i.slice(0, 4 * b), g = i.slice(4 * b, 4 * b + 16), {
          key: f,
          iv: g
        }
      },
      n = function (a, b, c) {
        b = w(b);
        var g, d = Math.ceil(a.length / 16),
          e = [],
          h = [];
        for (g = 0; g < d; g++) e[g] = f(a.slice(16 * g, 16 * g + 16));
        for (a.length % 16 === 0 && (e.push([16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16]), d++), g = 0; g < e.length; g++) e[g] = 0 === g ? v(e[g], c) : v(e[g], h[g - 1]), h[g] = p(e[g], b);
        return h
      },
      o = function (a, b, c, d) {
        b = w(b);
        var i, f = a.length / 16,
          h = [],
          j = [],
          k = "";
        for (i = 0; i < f; i++) h.push(a.slice(16 * i, 16 * (i + 1)));
        for (i = h.length - 1; i >= 0; i--) j[i] = q(h[i], b), j[i] = 0 === i ? v(j[i], c) : v(j[i], h[i - 1]);
        for (i = 0; i < f - 1; i++) k += g(j[i]);
        return k += g(j[i], !0), d ? k : e(k)
      },
      p = function (b, d) {
        c = !1;
        var f, e = u(b, d, 0);
        for (f = 1; f < a + 1; f++) e = r(e), e = s(e), f < a && (e = t(e)), e = u(e, d, f);
        return e
      },
      q = function (b, d) {
        c = !0;
        var f, e = u(b, d, a);
        for (f = a - 1; f > -1; f--) e = s(e), e = r(e), e = u(e, d, f), f > 0 && (e = t(e));
        return e
      },
      r = function (a) {
        var e, b = c ? E : D,
          d = [];
        for (e = 0; e < 16; e++) d[e] = b[a[e]];
        return d
      },
      s = function (a) {
        var e, b = [],
          d = c ? [0, 13, 10, 7, 4, 1, 14, 11, 8, 5, 2, 15, 12, 9, 6, 3] : [0, 5, 10, 15, 4, 9, 14, 3, 8, 13, 2, 7, 12, 1, 6, 11];
        for (e = 0; e < 16; e++) b[e] = a[d[e]];
        return b
      },
      t = function (a) {
        var d, b = [];
        if (c)
          for (d = 0; d < 4; d++) b[4 * d] = L[a[4 * d]] ^ J[a[1 + 4 * d]] ^ K[a[2 + 4 * d]] ^ I[a[3 + 4 * d]], b[1 + 4 * d] = I[a[4 * d]] ^ L[a[1 + 4 * d]] ^ J[a[2 + 4 * d]] ^ K[a[3 + 4 * d]], b[2 + 4 * d] = K[a[4 * d]] ^ I[a[1 + 4 * d]] ^ L[a[2 + 4 * d]] ^ J[a[3 + 4 * d]], b[3 + 4 * d] = J[a[4 * d]] ^ K[a[1 + 4 * d]] ^ I[a[2 + 4 * d]] ^ L[a[3 + 4 * d]];
        else
          for (d = 0; d < 4; d++) b[4 * d] = G[a[4 * d]] ^ H[a[1 + 4 * d]] ^ a[2 + 4 * d] ^ a[3 + 4 * d], b[1 + 4 * d] = a[4 * d] ^ G[a[1 + 4 * d]] ^ H[a[2 + 4 * d]] ^ a[3 + 4 * d], b[2 + 4 * d] = a[4 * d] ^ a[1 + 4 * d] ^ G[a[2 + 4 * d]] ^ H[a[3 + 4 * d]], b[3 + 4 * d] = H[a[4 * d]] ^ a[1 + 4 * d] ^ a[2 + 4 * d] ^ G[a[3 + 4 * d]];
        return b
      },
      u = function (a, b, c) {
        var e, d = [];
        for (e = 0; e < 16; e++) d[e] = a[e] ^ b[c][e];
        return d
      },
      v = function (a, b) {
        var d, c = [];
        for (d = 0; d < 16; d++) c[d] = a[d] ^ b[d];
        return c
      },
      w = function (c) {
        var f, g, h, j, d = [],
          e = [],
          i = [];
        for (f = 0; f < b; f++) g = [c[4 * f], c[4 * f + 1], c[4 * f + 2], c[4 * f + 3]], d[f] = g;
        for (f = b; f < 4 * (a + 1); f++) {
          for (d[f] = [], h = 0; h < 4; h++) e[h] = d[f - 1][h];
          for (f % b === 0 ? (e = x(y(e)), e[0] ^= F[f / b - 1]) : b > 6 && f % b === 4 && (e = x(e)), h = 0; h < 4; h++) d[f][h] = d[f - b][h] ^ e[h]
        }
        for (f = 0; f < a + 1; f++)
          for (i[f] = [], j = 0; j < 4; j++) i[f].push(d[4 * f + j][0], d[4 * f + j][1], d[4 * f + j][2], d[4 * f + j][3]);
        return i
      },
      x = function (a) {
        for (var b = 0; b < 4; b++) a[b] = D[a[b]];
        return a
      },
      y = function (a) {
        var c, b = a[0];
        for (c = 0; c < 4; c++) a[c] = a[c + 1];
        return a[3] = b, a
      },
      z = function (a, b) {
        var c, d = [];
        for (c = 0; c < a.length; c += b) d[c / b] = parseInt(a.substr(c, b), 16);
        return d
      },
      A = function (a) {
        var b, c = [];
        for (b = 0; b < a.length; b++) c[a[b]] = b;
        return c
      },
      B = function (a, b) {
        var c, d;
        for (d = 0, c = 0; c < 8; c++) d = 1 === (1 & b) ? d ^ a : d, a = a > 127 ? 283 ^ a << 1 : a << 1, b >>>= 1;
        return d
      },
      C = function (a) {
        var b, c = [];
        for (b = 0; b < 256; b++) c[b] = B(a, b);
        return c
      },
      D = z("637c777bf26b6fc53001672bfed7ab76ca82c97dfa5947f0add4a2af9ca472c0b7fd9326363ff7cc34a5e5f171d8311504c723c31896059a071280e2eb27b27509832c1a1b6e5aa0523bd6b329e32f8453d100ed20fcb15b6acbbe394a4c58cfd0efaafb434d338545f9027f503c9fa851a3408f929d38f5bcb6da2110fff3d2cd0c13ec5f974417c4a77e3d645d197360814fdc222a908846eeb814de5e0bdbe0323a0a4906245cc2d3ac629195e479e7c8376d8dd54ea96c56f4ea657aae08ba78252e1ca6b4c6e8dd741f4bbd8b8a703eb5664803f60e613557b986c11d9ee1f8981169d98e949b1e87e9ce5528df8ca1890dbfe6426841992d0fb054bb16", 2),
      E = A(D),
      F = z("01020408102040801b366cd8ab4d9a2f5ebc63c697356ad4b37dfaefc591", 2),
      G = C(2),
      H = C(3),
      I = C(9),
      J = C(11),
      K = C(13),
      L = C(14),
      M = function (a, b, c) {
        var h, d = l(8),
          e = m(j(b, c), d),
          f = e.key,
          g = e.iv,
          i = [
            [83, 97, 108, 116, 101, 100, 95, 95].concat(d)
          ];
        return a = j(a, c), h = n(a, f, g), h = i.concat(h), R.encode(h)
      },
      N = function (a, b, c) {
        var d = R.decode(a),
          e = d.slice(8, 16),
          f = m(j(b, c), e),
          g = f.key,
          h = f.iv;
        return d = d.slice(16, d.length), a = o(d, g, h, c)
      },
      O = function (a) {
        function b(a, b) {
          return a << b | a >>> 32 - b
        }

        function c(a, b) {
          var c, d, e, f, g;
          return e = 2147483648 & a, f = 2147483648 & b, c = 1073741824 & a, d = 1073741824 & b, g = (1073741823 & a) + (1073741823 & b), c & d ? 2147483648 ^ g ^ e ^ f : c | d ? 1073741824 & g ? 3221225472 ^ g ^ e ^ f : 1073741824 ^ g ^ e ^ f : g ^ e ^ f
        }

        function d(a, b, c) {
          return a & b | ~a & c
        }

        function e(a, b, c) {
          return a & c | b & ~c
        }

        function f(a, b, c) {
          return a ^ b ^ c
        }

        function g(a, b, c) {
          return b ^ (a | ~c)
        }

        function h(a, e, f, g, h, i, j) {
          return a = c(a, c(c(d(e, f, g), h), j)), c(b(a, i), e)
        }

        function i(a, d, f, g, h, i, j) {
          return a = c(a, c(c(e(d, f, g), h), j)), c(b(a, i), d)
        }

        function j(a, d, e, g, h, i, j) {
          return a = c(a, c(c(f(d, e, g), h), j)), c(b(a, i), d)
        }

        function k(a, d, e, f, h, i, j) {
          return a = c(a, c(c(g(d, e, f), h), j)), c(b(a, i), d)
        }

        function l(a) {
          for (var b, c = a.length, d = c + 8, e = (d - d % 64) / 64, f = 16 * (e + 1), g = [], h = 0, i = 0; i < c;) b = (i - i % 4) / 4, h = i % 4 * 8, g[b] = g[b] | a[i] << h, i++;
          return b = (i - i % 4) / 4, h = i % 4 * 8, g[b] = g[b] | 128 << h, g[f - 2] = c << 3, g[f - 1] = c >>> 29, g
        }

        function m(a) {
          var b, c, d = [];
          for (c = 0; c <= 3; c++) b = a >>> 8 * c & 255, d = d.concat(b);
          return d
        }
        var o, p, q, r, s, t, u, v, w, n = [],
          x = z("67452301efcdab8998badcfe10325476d76aa478e8c7b756242070dbc1bdceeef57c0faf4787c62aa8304613fd469501698098d88b44f7afffff5bb1895cd7be6b901122fd987193a679438e49b40821f61e2562c040b340265e5a51e9b6c7aad62f105d02441453d8a1e681e7d3fbc821e1cde6c33707d6f4d50d87455a14eda9e3e905fcefa3f8676f02d98d2a4c8afffa39428771f6816d9d6122fde5380ca4beea444bdecfa9f6bb4b60bebfbc70289b7ec6eaa127fad4ef308504881d05d9d4d039e6db99e51fa27cf8c4ac5665f4292244432aff97ab9423a7fc93a039655b59c38f0ccc92ffeff47d85845dd16fa87e4ffe2ce6e0a30143144e0811a1f7537e82bd3af2352ad7d2bbeb86d391", 8);
        for (n = l(a), t = x[0], u = x[1], v = x[2], w = x[3], o = 0; o < n.length; o += 16) p = t, q = u, r = v, s = w, t = h(t, u, v, w, n[o + 0], 7, x[4]), w = h(w, t, u, v, n[o + 1], 12, x[5]), v = h(v, w, t, u, n[o + 2], 17, x[6]), u = h(u, v, w, t, n[o + 3], 22, x[7]), t = h(t, u, v, w, n[o + 4], 7, x[8]), w = h(w, t, u, v, n[o + 5], 12, x[9]), v = h(v, w, t, u, n[o + 6], 17, x[10]), u = h(u, v, w, t, n[o + 7], 22, x[11]), t = h(t, u, v, w, n[o + 8], 7, x[12]), w = h(w, t, u, v, n[o + 9], 12, x[13]), v = h(v, w, t, u, n[o + 10], 17, x[14]), u = h(u, v, w, t, n[o + 11], 22, x[15]), t = h(t, u, v, w, n[o + 12], 7, x[16]), w = h(w, t, u, v, n[o + 13], 12, x[17]), v = h(v, w, t, u, n[o + 14], 17, x[18]), u = h(u, v, w, t, n[o + 15], 22, x[19]), t = i(t, u, v, w, n[o + 1], 5, x[20]), w = i(w, t, u, v, n[o + 6], 9, x[21]), v = i(v, w, t, u, n[o + 11], 14, x[22]), u = i(u, v, w, t, n[o + 0], 20, x[23]), t = i(t, u, v, w, n[o + 5], 5, x[24]), w = i(w, t, u, v, n[o + 10], 9, x[25]), v = i(v, w, t, u, n[o + 15], 14, x[26]), u = i(u, v, w, t, n[o + 4], 20, x[27]), t = i(t, u, v, w, n[o + 9], 5, x[28]), w = i(w, t, u, v, n[o + 14], 9, x[29]), v = i(v, w, t, u, n[o + 3], 14, x[30]), u = i(u, v, w, t, n[o + 8], 20, x[31]), t = i(t, u, v, w, n[o + 13], 5, x[32]), w = i(w, t, u, v, n[o + 2], 9, x[33]), v = i(v, w, t, u, n[o + 7], 14, x[34]), u = i(u, v, w, t, n[o + 12], 20, x[35]), t = j(t, u, v, w, n[o + 5], 4, x[36]), w = j(w, t, u, v, n[o + 8], 11, x[37]), v = j(v, w, t, u, n[o + 11], 16, x[38]), u = j(u, v, w, t, n[o + 14], 23, x[39]), t = j(t, u, v, w, n[o + 1], 4, x[40]), w = j(w, t, u, v, n[o + 4], 11, x[41]), v = j(v, w, t, u, n[o + 7], 16, x[42]), u = j(u, v, w, t, n[o + 10], 23, x[43]), t = j(t, u, v, w, n[o + 13], 4, x[44]), w = j(w, t, u, v, n[o + 0], 11, x[45]), v = j(v, w, t, u, n[o + 3], 16, x[46]), u = j(u, v, w, t, n[o + 6], 23, x[47]), t = j(t, u, v, w, n[o + 9], 4, x[48]), w = j(w, t, u, v, n[o + 12], 11, x[49]), v = j(v, w, t, u, n[o + 15], 16, x[50]), u = j(u, v, w, t, n[o + 2], 23, x[51]), t = k(t, u, v, w, n[o + 0], 6, x[52]), w = k(w, t, u, v, n[o + 7], 10, x[53]), v = k(v, w, t, u, n[o + 14], 15, x[54]), u = k(u, v, w, t, n[o + 5], 21, x[55]), t = k(t, u, v, w, n[o + 12], 6, x[56]), w = k(w, t, u, v, n[o + 3], 10, x[57]), v = k(v, w, t, u, n[o + 10], 15, x[58]), u = k(u, v, w, t, n[o + 1], 21, x[59]), t = k(t, u, v, w, n[o + 8], 6, x[60]), w = k(w, t, u, v, n[o + 15], 10, x[61]), v = k(v, w, t, u, n[o + 6], 15, x[62]), u = k(u, v, w, t, n[o + 13], 21, x[63]), t = k(t, u, v, w, n[o + 4], 6, x[64]), w = k(w, t, u, v, n[o + 11], 10, x[65]), v = k(v, w, t, u, n[o + 2], 15, x[66]), u = k(u, v, w, t, n[o + 9], 21, x[67]), t = c(t, p), u = c(u, q), v = c(v, r), w = c(w, s);
        return m(t).concat(m(u), m(v), m(w))
      },
      R = function () {
        var a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
          b = a.split(""),
          c = function (a, c) {
            var f, g, d = [],
              e = "";
            Math.floor(16 * a.length / 3);
            for (f = 0; f < 16 * a.length; f++) d.push(a[Math.floor(f / 16)][f % 16]);
            for (f = 0; f < d.length; f += 3) e += b[d[f] >> 2], e += b[(3 & d[f]) << 4 | d[f + 1] >> 4], e += void 0 !== d[f + 1] ? b[(15 & d[f + 1]) << 2 | d[f + 2] >> 6] : "=", e += void 0 !== d[f + 2] ? b[63 & d[f + 2]] : "=";
            for (g = e.slice(0, 64) + "\n", f = 1; f < Math.ceil(e.length / 64); f++) g += e.slice(64 * f, 64 * f + 64) + (Math.ceil(e.length / 64) === f + 1 ? "" : "\n");
            return g
          },
          d = function (b) {
            b = b.replace(/\n/g, "");
            var f, c = [],
              d = [],
              e = [];
            for (f = 0; f < b.length; f += 4) d[0] = a.indexOf(b.charAt(f)), d[1] = a.indexOf(b.charAt(f + 1)), d[2] = a.indexOf(b.charAt(f + 2)), d[3] = a.indexOf(b.charAt(f + 3)), e[0] = d[0] << 2 | d[1] >> 4, e[1] = (15 & d[1]) << 4 | d[2] >> 2, e[2] = (3 & d[2]) << 6 | d[3], c.push(e[0], e[1], e[2]);
            return c = c.slice(0, c.length - c.length % 16)
          };
        return "function" == typeof Array.indexOf && (a = b), {
          encode: c,
          decode: d
        }
      }();
    return {
      size: k,
      h2a: i,
      expandKey: w,
      encryptBlock: p,
      decryptBlock: q,
      Decrypt: c,
      s2a: j,
      rawEncrypt: n,
      rawDecrypt: o,
      dec: N,
      openSSLKey: m,
      a2h: h,
      enc: M,
      Hash: {
        MD5: O
      },
      Base64: R
    }
  });
var My2c2p = {
  version: "1.6.7"
};
My2c2p.errorDescription = function (a) {
  var b = ["card number is required", "card number is invalid", "expiry month is required", "expiry month must be two characters", "expiry year is required", "expiry year must be four characters", "card already expired(year)", "card already expired(month)", "invalid card expiry month", "invalid cvv", "invalid month", "invalid year"];
  return a - 1 > b.length ? "unknown error" : b[a - 1]
};
var extractForm = function (a) {
  return window.jQuery && a instanceof jQuery ? a[0] : a.nodeType && 1 === a.nodeType ? a : document.getElementById(a)
};
My2c2p.getEncryptedData = function (a, b) { }, My2c2p.onSubmitFormWithReturn = function (a, b, c) {
  var d = this,
    e = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDKakJC+2MSZikKoPzlNqXvJCuWNLhejg3gMRePSetYNNgnhyqFwwAR7t7i/B2QFZoixSYc2/23cJz0jA5O+q+Cu3fycqKlf1L9966+X3B9nyHe2eKQZr8KrcS/8+sEKcd0pLATY4AleW1iktuN+2oghrDKuv+aDNztWcOy+PTofwIDAQAB",
    f = function (a) {
      var b = [],
        c = 0;
      for (c = 0; c < a.children.length; c++) child = a.children[c], 1 === child.nodeType && child.attributes["data-encrypt"] ? b.push(child) : child.children.length > 0 && (b = b.concat(f(child)));
      return b
    },
    g = function (a) {
      for (var b = {
        cardnumber: "",
        cvv: "",
        month: "",
        year: ""
      }, c = f(a), d = 0; d < c.length; d++) {
        var e = c[d].value;
        c[d].removeAttribute("name");
        var g = c[d].attributes["data-encrypt"].value;
        "cardnumber" == g ? b.cardnumber = e : "cvv" == g ? b.cvv = e : "month" == g ? b.month = e : "year" == g && (b.year = e)
      }
      return b
    },
    j = function () {
      for (var a = "", b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-+=_", c = 0; c < 8; c++) a += b.charAt(Math.floor(Math.random() * b.length));
      return a
    },
    k = function (a, b) {
      return GibberishAES.enc(a, b)
    },
    l = function (a) {
      var c, d, e, f, b = [];
      if ("INTEGER" === a.typeName() && (c = a.posContent(), d = a.posEnd(), e = a.stream.hexDump(c, d), e = e.replace(/[ \n]/g, ""), b.push(e)), null !== a.sub)
        for (f = 0; f < a.sub.length; f++) {
          var g = l(a.sub[f]);
          b = b.concat(g)
        }
      return b
    },
    m = function (a) {
      var b, c, d = e;
      try {
        b = b64toBA(d), c = ASN1.decode(b)
      } catch (a) {
        throw "Invalid public key."
      }
      var f = l(c);
      if (2 != f.length) throw "Invalid public key.";
      var g = f[0],
        h = f[1];
      "00" == g.substr(0, 2) && (g = g.substr(2)), "0" == h.substr(0, 1) && (h = h.substr(1));
      var i = new RSAKey;
      i.setPublic(g, h);
      var j = i.encrypt(a);
      return hex2b64(j)
    },
    n = function (a, b, c) {
      var d = document.getElementsByName(b);
      console.log(a.elements.namedItem(b)), d.length > 0 && "undefined" != typeof a.elements.namedItem(b) && null != a.elements.namedItem(b) && a.removeChild(d[0]);
      var e = document.createElement("input");
      e.setAttribute("type", "hidden"), e.setAttribute("name", b), e.setAttribute("value", c), a.appendChild(e)
    };
  d.isEmpty = function (a) {
    return !a || 0 === a.length
  };
  var o = function (a) {
    var b, c, d, e, f;
    for (e = "", b = 0; b < a.length; b++) d = parseInt(a.charAt(b), 10), d >= 0 && d <= 9 && (e = d + e);
    if (e.length <= 1) return !1;
    for (f = "", b = 0; b < e.length; b++) d = parseInt(e.charAt(b), 10), b % 2 != 0 && (d *= 2), f += d;
    for (c = 0, b = 0; b < f.length; b++) d = parseInt(f.charAt(b), 10), c += d;
    return 0 != c && c % 10 == 0
  },
    p = function (a) {
      var b = new Date,
        c = b.getFullYear(),
        e = b.getMonth();
      e += 1;
      var f = g(a),
        h = parseInt(f.month, 10) || 0,
        i = parseInt(f.year, 10) || 0,
        j = !1;
      if (d.isEmpty(f.cardnumber) && d.isEmpty(f.month) && d.isEmpty(f.year) || (j = !0), j) {
        if (d.isEmpty(f.cardnumber)) return 1;
        if (d.isEmpty(f.month)) return 3;
        if (d.isEmpty(f.year)) return 5;
        if (!o(f.cardnumber)) return 2;
        if (f.month.length > 2 || f.month.length < 1) return 4;
        if (d.isEmpty(f.year)) return 5;
        if (4 != f.year.length) return 6;
        if (!f.month.match(/^\d+$/)) return 11;
        if (!f.year.match(/^\d+$/)) return 12;
        if (i < c && "0000" != f.year) return 7;
        if (i == c) {
          if (h < 1 || h > 12) return 9;
          if (h < e) return 8
        } else {
          if ("0000" == f.year && "00" != f.month) return 9;
          if ((h < 1 || h > 12) && "00" != f.month) return 9
        }
        if (!f.cvv.match(/^[0-9]{3,4}$/) && !d.isEmpty(f.cvv)) return 10
      } else if (d.isEmpty(f.cvv));
      else if (!f.cvv.match(/^[0-9]{3,4}$/) && !d.isEmpty(f.cvv)) return 10;
      return 0
    },
    q = function (a) {
      var b = a.substring(0, 6),
        c = a.substring(a.length - 4),
        d = a.length - 10,
        e = b;
      if (d > 0) {
        for (i = 0; i < d; i++) e += "X";
        return e += c
      }
      return a
    },
    r = function (a) {
      var b = g(a),
        c = j(),
        e = m(c),
        f = b.cardnumber,
        i = q(f),
        l = b.month,
        o = b.year,
        p = b.cvv,
        r = "",
        s = parseInt(b.month, 10) || 0;
      r = s < 10 ? "0" + s : "" + s;
      var t = b.year;
      d.isEmpty(p) && (p = "");
      var u = f + ";" + r + ";" + t + ";" + p,
        v = k(u, c);
      u = "", f = "", p = "", r = "", t = "", c = "";
      var w = e.length,
        x = w.toString(16);
      for (h = x.length; h < 4; h++) x = "0" + x;
      var y = x + e + v;
      y = y.replace("\n", ""), n(a, "encryptedCardInfo", y), n(a, "maskedCardInfo", i), n(a, "expMonthCardInfo", l), n(a, "expYearCardInfo", o)
    },
    a = extractForm(a);
  d.callbackForm = function (b) {
    var e = p(a);
    0 != e ? ("" != b && b.preventDefault(), c ? c(e, d.errorDescription(e)) : alert(d.errorDescription(e))) : (r(a), c && c(0, ""))
  }, b ? window.jQuery ? window.jQuery(a).submit(d.callbackForm) : a.addEventListener ? a.addEventListener("submit", d.callbackForm, !1) : a.attachEvent && a.attachEvent("onsubmit", d.callbackForm) : d.callbackForm("")
}, My2c2p.onSubmitForm = function (a, b) {
  My2c2p.onSubmitFormWithReturn(a, !0, b)
}, My2c2p.submitForm = function (a, b) {
  My2c2p.onSubmitFormWithReturn(a, !0, function (c, d) {
    if (0 == c && "" == d) {
      var e = extractForm(a);
      e.submit()
    } else b(c, d)
  }), My2c2p.callbackForm("")
}, My2c2p.getEncrypted = function (a, b) {
  My2c2p.onSubmitFormWithReturn(a, !1, function (a, c) {
    if (0 == a && "" == c) {
      var d = document.getElementsByName("encryptedCardInfo"),
        e = document.getElementsByName("maskedCardInfo"),
        f = document.getElementsByName("expMonthCardInfo"),
        g = document.getElementsByName("expYearCardInfo"),
        h = {
          encryptedCardInfo: d[0].value,
          maskedCardInfo: e[0].value,
          expMonthCardInfo: f[0].value,
          expYearCardInfo: g[0].value
        };
      b(h, 0, "")
    } else {
      var h = {
        encryptedCardInfo: "",
        maskedCardInfo: "",
        expMonthCardInfo: "",
        expYearCardInfo: ""
      };
      b(h, a, c)
    }
  })
};

export default My2c2p;