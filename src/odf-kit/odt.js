var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err2) => function __init() {
  if (err2) throw err2[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err2 = [e], e;
  }
};

// node_modules/fflate/esm/browser.js
function deflateSync(data, opts) {
  return dopt(data, opts || {}, 0, 0);
}
function strToU8(str, latin1) {
  if (latin1) {
    var ar_1 = new u8(str.length);
    for (var i2 = 0; i2 < str.length; ++i2)
      ar_1[i2] = str.charCodeAt(i2);
    return ar_1;
  }
  if (te)
    return te.encode(str);
  var l = str.length;
  var ar = new u8(str.length + (str.length >> 1));
  var ai = 0;
  var w = function(v) {
    ar[ai++] = v;
  };
  for (var i2 = 0; i2 < l; ++i2) {
    if (ai + 5 > ar.length) {
      var n = new u8(ai + 8 + (l - i2 << 1));
      n.set(ar);
      ar = n;
    }
    var c = str.charCodeAt(i2);
    if (c < 128 || latin1)
      w(c);
    else if (c < 2048)
      w(192 | c >> 6), w(128 | c & 63);
    else if (c > 55295 && c < 57344)
      c = 65536 + (c & 1023 << 10) | str.charCodeAt(++i2) & 1023, w(240 | c >> 18), w(128 | c >> 12 & 63), w(128 | c >> 6 & 63), w(128 | c & 63);
    else
      w(224 | c >> 12), w(128 | c >> 6 & 63), w(128 | c & 63);
  }
  return slc(ar, 0, ai);
}
function zipSync(data, opts) {
  if (!opts)
    opts = {};
  var r = {};
  var files = [];
  fltn(data, "", r, opts);
  var o = 0;
  var tot = 0;
  for (var fn in r) {
    var _a2 = r[fn], file = _a2[0], p = _a2[1];
    var compression = p.level == 0 ? 0 : 8;
    var f = strToU8(fn), s = f.length;
    var com = p.comment, m = com && strToU8(com), ms = m && m.length;
    var exl = exfl(p.extra);
    if (s > 65535)
      err(11);
    var d = compression ? deflateSync(file, p) : file, l = d.length;
    var c = crc();
    c.p(file);
    files.push(mrg(p, {
      size: file.length,
      crc: c.d(),
      c: d,
      f,
      m,
      u: s != fn.length || m && com.length != ms,
      o,
      compression
    }));
    o += 30 + s + exl + l;
    tot += 76 + 2 * (s + exl) + (ms || 0) + l;
  }
  var out = new u8(tot + 22), oe = o, cdl = tot - o;
  for (var i2 = 0; i2 < files.length; ++i2) {
    var f = files[i2];
    wzh(out, f.o, f, f.f, f.u, f.c.length);
    var badd = 30 + f.f.length + exfl(f.extra);
    out.set(f.c, f.o + badd);
    wzh(out, o, f, f.f, f.u, f.c.length, f.o, f.m), o += 16 + badd + (f.m ? f.m.length : 0);
  }
  wzf(out, o, files.length, cdl, oe);
  return out;
}
var u8, u16, i32, fleb, fdeb, clim, freb, _a, fl, revfl, _b, fd, revfd, rev, x, i, hMap, flt, i, i, i, i, fdt, i, flm, fdm, shft, slc, ec, err, wbits, wbits16, hTree, ln, lc, clen, wfblk, wblk, deo, et, dflt, crct, crc, dopt, mrg, wbytes, fltn, te, td, tds, exfl, wzh, wzf;
var init_browser = __esm({
  "node_modules/fflate/esm/browser.js"() {
    u8 = Uint8Array;
    u16 = Uint16Array;
    i32 = Int32Array;
    fleb = new u8([
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      2,
      2,
      2,
      2,
      3,
      3,
      3,
      3,
      4,
      4,
      4,
      4,
      5,
      5,
      5,
      5,
      0,
      /* unused */
      0,
      0,
      /* impossible */
      0
    ]);
    fdeb = new u8([
      0,
      0,
      0,
      0,
      1,
      1,
      2,
      2,
      3,
      3,
      4,
      4,
      5,
      5,
      6,
      6,
      7,
      7,
      8,
      8,
      9,
      9,
      10,
      10,
      11,
      11,
      12,
      12,
      13,
      13,
      /* unused */
      0,
      0
    ]);
    clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
    freb = function(eb, start) {
      var b = new u16(31);
      for (var i2 = 0; i2 < 31; ++i2) {
        b[i2] = start += 1 << eb[i2 - 1];
      }
      var r = new i32(b[30]);
      for (var i2 = 1; i2 < 30; ++i2) {
        for (var j = b[i2]; j < b[i2 + 1]; ++j) {
          r[j] = j - b[i2] << 5 | i2;
        }
      }
      return { b, r };
    };
    _a = freb(fleb, 2);
    fl = _a.b;
    revfl = _a.r;
    fl[28] = 258, revfl[258] = 28;
    _b = freb(fdeb, 0);
    fd = _b.b;
    revfd = _b.r;
    rev = new u16(32768);
    for (i = 0; i < 32768; ++i) {
      x = (i & 43690) >> 1 | (i & 21845) << 1;
      x = (x & 52428) >> 2 | (x & 13107) << 2;
      x = (x & 61680) >> 4 | (x & 3855) << 4;
      rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
    }
    hMap = (function(cd, mb, r) {
      var s = cd.length;
      var i2 = 0;
      var l = new u16(mb);
      for (; i2 < s; ++i2) {
        if (cd[i2])
          ++l[cd[i2] - 1];
      }
      var le = new u16(mb);
      for (i2 = 1; i2 < mb; ++i2) {
        le[i2] = le[i2 - 1] + l[i2 - 1] << 1;
      }
      var co;
      if (r) {
        co = new u16(1 << mb);
        var rvb = 15 - mb;
        for (i2 = 0; i2 < s; ++i2) {
          if (cd[i2]) {
            var sv = i2 << 4 | cd[i2];
            var r_1 = mb - cd[i2];
            var v = le[cd[i2] - 1]++ << r_1;
            for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
              co[rev[v] >> rvb] = sv;
            }
          }
        }
      } else {
        co = new u16(s);
        for (i2 = 0; i2 < s; ++i2) {
          if (cd[i2]) {
            co[i2] = rev[le[cd[i2] - 1]++] >> 15 - cd[i2];
          }
        }
      }
      return co;
    });
    flt = new u8(288);
    for (i = 0; i < 144; ++i)
      flt[i] = 8;
    for (i = 144; i < 256; ++i)
      flt[i] = 9;
    for (i = 256; i < 280; ++i)
      flt[i] = 7;
    for (i = 280; i < 288; ++i)
      flt[i] = 8;
    fdt = new u8(32);
    for (i = 0; i < 32; ++i)
      fdt[i] = 5;
    flm = /* @__PURE__ */ hMap(flt, 9, 0);
    fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
    shft = function(p) {
      return (p + 7) / 8 | 0;
    };
    slc = function(v, s, e) {
      if (s == null || s < 0)
        s = 0;
      if (e == null || e > v.length)
        e = v.length;
      return new u8(v.subarray(s, e));
    };
    ec = [
      "unexpected EOF",
      "invalid block type",
      "invalid length/literal",
      "invalid distance",
      "stream finished",
      "no stream handler",
      ,
      // determined by compression function
      "no callback",
      "invalid UTF-8 data",
      "extra field too long",
      "date not in range 1980-2099",
      "filename too long",
      "stream finishing",
      "invalid zip data"
      // determined by unknown compression method
    ];
    err = function(ind, msg, nt) {
      var e = new Error(msg || ec[ind]);
      e.code = ind;
      if (Error.captureStackTrace)
        Error.captureStackTrace(e, err);
      if (!nt)
        throw e;
      return e;
    };
    wbits = function(d, p, v) {
      v <<= p & 7;
      var o = p / 8 | 0;
      d[o] |= v;
      d[o + 1] |= v >> 8;
    };
    wbits16 = function(d, p, v) {
      v <<= p & 7;
      var o = p / 8 | 0;
      d[o] |= v;
      d[o + 1] |= v >> 8;
      d[o + 2] |= v >> 16;
    };
    hTree = function(d, mb) {
      var t = [];
      for (var i2 = 0; i2 < d.length; ++i2) {
        if (d[i2])
          t.push({ s: i2, f: d[i2] });
      }
      var s = t.length;
      var t2 = t.slice();
      if (!s)
        return { t: et, l: 0 };
      if (s == 1) {
        var v = new u8(t[0].s + 1);
        v[t[0].s] = 1;
        return { t: v, l: 1 };
      }
      t.sort(function(a, b) {
        return a.f - b.f;
      });
      t.push({ s: -1, f: 25001 });
      var l = t[0], r = t[1], i0 = 0, i1 = 1, i22 = 2;
      t[0] = { s: -1, f: l.f + r.f, l, r };
      while (i1 != s - 1) {
        l = t[t[i0].f < t[i22].f ? i0++ : i22++];
        r = t[i0 != i1 && t[i0].f < t[i22].f ? i0++ : i22++];
        t[i1++] = { s: -1, f: l.f + r.f, l, r };
      }
      var maxSym = t2[0].s;
      for (var i2 = 1; i2 < s; ++i2) {
        if (t2[i2].s > maxSym)
          maxSym = t2[i2].s;
      }
      var tr = new u16(maxSym + 1);
      var mbt = ln(t[i1 - 1], tr, 0);
      if (mbt > mb) {
        var i2 = 0, dt = 0;
        var lft = mbt - mb, cst = 1 << lft;
        t2.sort(function(a, b) {
          return tr[b.s] - tr[a.s] || a.f - b.f;
        });
        for (; i2 < s; ++i2) {
          var i2_1 = t2[i2].s;
          if (tr[i2_1] > mb) {
            dt += cst - (1 << mbt - tr[i2_1]);
            tr[i2_1] = mb;
          } else
            break;
        }
        dt >>= lft;
        while (dt > 0) {
          var i2_2 = t2[i2].s;
          if (tr[i2_2] < mb)
            dt -= 1 << mb - tr[i2_2]++ - 1;
          else
            ++i2;
        }
        for (; i2 >= 0 && dt; --i2) {
          var i2_3 = t2[i2].s;
          if (tr[i2_3] == mb) {
            --tr[i2_3];
            ++dt;
          }
        }
        mbt = mb;
      }
      return { t: new u8(tr), l: mbt };
    };
    ln = function(n, l, d) {
      return n.s == -1 ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1)) : l[n.s] = d;
    };
    lc = function(c) {
      var s = c.length;
      while (s && !c[--s])
        ;
      var cl = new u16(++s);
      var cli = 0, cln = c[0], cls = 1;
      var w = function(v) {
        cl[cli++] = v;
      };
      for (var i2 = 1; i2 <= s; ++i2) {
        if (c[i2] == cln && i2 != s)
          ++cls;
        else {
          if (!cln && cls > 2) {
            for (; cls > 138; cls -= 138)
              w(32754);
            if (cls > 2) {
              w(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
              cls = 0;
            }
          } else if (cls > 3) {
            w(cln), --cls;
            for (; cls > 6; cls -= 6)
              w(8304);
            if (cls > 2)
              w(cls - 3 << 5 | 8208), cls = 0;
          }
          while (cls--)
            w(cln);
          cls = 1;
          cln = c[i2];
        }
      }
      return { c: cl.subarray(0, cli), n: s };
    };
    clen = function(cf, cl) {
      var l = 0;
      for (var i2 = 0; i2 < cl.length; ++i2)
        l += cf[i2] * cl[i2];
      return l;
    };
    wfblk = function(out, pos, dat) {
      var s = dat.length;
      var o = shft(pos + 2);
      out[o] = s & 255;
      out[o + 1] = s >> 8;
      out[o + 2] = out[o] ^ 255;
      out[o + 3] = out[o + 1] ^ 255;
      for (var i2 = 0; i2 < s; ++i2)
        out[o + i2 + 4] = dat[i2];
      return (o + 4 + s) * 8;
    };
    wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
      wbits(out, p++, final);
      ++lf[256];
      var _a2 = hTree(lf, 15), dlt = _a2.t, mlb = _a2.l;
      var _b2 = hTree(df, 15), ddt = _b2.t, mdb = _b2.l;
      var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
      var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
      var lcfreq = new u16(19);
      for (var i2 = 0; i2 < lclt.length; ++i2)
        ++lcfreq[lclt[i2] & 31];
      for (var i2 = 0; i2 < lcdt.length; ++i2)
        ++lcfreq[lcdt[i2] & 31];
      var _e = hTree(lcfreq, 7), lct = _e.t, mlcb = _e.l;
      var nlcc = 19;
      for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
        ;
      var flen = bl + 5 << 3;
      var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
      var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
      if (bs >= 0 && flen <= ftlen && flen <= dtlen)
        return wfblk(out, p, dat.subarray(bs, bs + bl));
      var lm, ll, dm, dl;
      wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
      if (dtlen < ftlen) {
        lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
        var llm = hMap(lct, mlcb, 0);
        wbits(out, p, nlc - 257);
        wbits(out, p + 5, ndc - 1);
        wbits(out, p + 10, nlcc - 4);
        p += 14;
        for (var i2 = 0; i2 < nlcc; ++i2)
          wbits(out, p + 3 * i2, lct[clim[i2]]);
        p += 3 * nlcc;
        var lcts = [lclt, lcdt];
        for (var it = 0; it < 2; ++it) {
          var clct = lcts[it];
          for (var i2 = 0; i2 < clct.length; ++i2) {
            var len = clct[i2] & 31;
            wbits(out, p, llm[len]), p += lct[len];
            if (len > 15)
              wbits(out, p, clct[i2] >> 5 & 127), p += clct[i2] >> 12;
          }
        }
      } else {
        lm = flm, ll = flt, dm = fdm, dl = fdt;
      }
      for (var i2 = 0; i2 < li; ++i2) {
        var sym = syms[i2];
        if (sym > 255) {
          var len = sym >> 18 & 31;
          wbits16(out, p, lm[len + 257]), p += ll[len + 257];
          if (len > 7)
            wbits(out, p, sym >> 23 & 31), p += fleb[len];
          var dst = sym & 31;
          wbits16(out, p, dm[dst]), p += dl[dst];
          if (dst > 3)
            wbits16(out, p, sym >> 5 & 8191), p += fdeb[dst];
        } else {
          wbits16(out, p, lm[sym]), p += ll[sym];
        }
      }
      wbits16(out, p, lm[256]);
      return p + ll[256];
    };
    deo = /* @__PURE__ */ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
    et = /* @__PURE__ */ new u8(0);
    dflt = function(dat, lvl, plvl, pre, post, st) {
      var s = st.z || dat.length;
      var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7e3)) + post);
      var w = o.subarray(pre, o.length - post);
      var lst = st.l;
      var pos = (st.r || 0) & 7;
      if (lvl) {
        if (pos)
          w[0] = st.r >> 3;
        var opt = deo[lvl - 1];
        var n = opt >> 13, c = opt & 8191;
        var msk_1 = (1 << plvl) - 1;
        var prev = st.p || new u16(32768), head = st.h || new u16(msk_1 + 1);
        var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
        var hsh = function(i3) {
          return (dat[i3] ^ dat[i3 + 1] << bs1_1 ^ dat[i3 + 2] << bs2_1) & msk_1;
        };
        var syms = new i32(25e3);
        var lf = new u16(288), df = new u16(32);
        var lc_1 = 0, eb = 0, i2 = st.i || 0, li = 0, wi = st.w || 0, bs = 0;
        for (; i2 + 2 < s; ++i2) {
          var hv = hsh(i2);
          var imod = i2 & 32767, pimod = head[hv];
          prev[imod] = pimod;
          head[hv] = imod;
          if (wi <= i2) {
            var rem = s - i2;
            if ((lc_1 > 7e3 || li > 24576) && (rem > 423 || !lst)) {
              pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i2 - bs, pos);
              li = lc_1 = eb = 0, bs = i2;
              for (var j = 0; j < 286; ++j)
                lf[j] = 0;
              for (var j = 0; j < 30; ++j)
                df[j] = 0;
            }
            var l = 2, d = 0, ch_1 = c, dif = imod - pimod & 32767;
            if (rem > 2 && hv == hsh(i2 - dif)) {
              var maxn = Math.min(n, rem) - 1;
              var maxd = Math.min(32767, i2);
              var ml = Math.min(258, rem);
              while (dif <= maxd && --ch_1 && imod != pimod) {
                if (dat[i2 + l] == dat[i2 + l - dif]) {
                  var nl = 0;
                  for (; nl < ml && dat[i2 + nl] == dat[i2 + nl - dif]; ++nl)
                    ;
                  if (nl > l) {
                    l = nl, d = dif;
                    if (nl > maxn)
                      break;
                    var mmd = Math.min(dif, nl - 2);
                    var md = 0;
                    for (var j = 0; j < mmd; ++j) {
                      var ti = i2 - dif + j & 32767;
                      var pti = prev[ti];
                      var cd = ti - pti & 32767;
                      if (cd > md)
                        md = cd, pimod = ti;
                    }
                  }
                }
                imod = pimod, pimod = prev[imod];
                dif += imod - pimod & 32767;
              }
            }
            if (d) {
              syms[li++] = 268435456 | revfl[l] << 18 | revfd[d];
              var lin = revfl[l] & 31, din = revfd[d] & 31;
              eb += fleb[lin] + fdeb[din];
              ++lf[257 + lin];
              ++df[din];
              wi = i2 + l;
              ++lc_1;
            } else {
              syms[li++] = dat[i2];
              ++lf[dat[i2]];
            }
          }
        }
        for (i2 = Math.max(i2, wi); i2 < s; ++i2) {
          syms[li++] = dat[i2];
          ++lf[dat[i2]];
        }
        pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i2 - bs, pos);
        if (!lst) {
          st.r = pos & 7 | w[pos / 8 | 0] << 3;
          pos -= 7;
          st.h = head, st.p = prev, st.i = i2, st.w = wi;
        }
      } else {
        for (var i2 = st.w || 0; i2 < s + lst; i2 += 65535) {
          var e = i2 + 65535;
          if (e >= s) {
            w[pos / 8 | 0] = lst;
            e = s;
          }
          pos = wfblk(w, pos + 1, dat.subarray(i2, e));
        }
        st.i = s;
      }
      return slc(o, 0, pre + shft(pos) + post);
    };
    crct = /* @__PURE__ */ (function() {
      var t = new Int32Array(256);
      for (var i2 = 0; i2 < 256; ++i2) {
        var c = i2, k = 9;
        while (--k)
          c = (c & 1 && -306674912) ^ c >>> 1;
        t[i2] = c;
      }
      return t;
    })();
    crc = function() {
      var c = -1;
      return {
        p: function(d) {
          var cr = c;
          for (var i2 = 0; i2 < d.length; ++i2)
            cr = crct[cr & 255 ^ d[i2]] ^ cr >>> 8;
          c = cr;
        },
        d: function() {
          return ~c;
        }
      };
    };
    dopt = function(dat, opt, pre, post, st) {
      if (!st) {
        st = { l: 1 };
        if (opt.dictionary) {
          var dict = opt.dictionary.subarray(-32768);
          var newDat = new u8(dict.length + dat.length);
          newDat.set(dict);
          newDat.set(dat, dict.length);
          dat = newDat;
          st.w = dict.length;
        }
      }
      return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? st.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20 : 12 + opt.mem, pre, post, st);
    };
    mrg = function(a, b) {
      var o = {};
      for (var k in a)
        o[k] = a[k];
      for (var k in b)
        o[k] = b[k];
      return o;
    };
    wbytes = function(d, b, v) {
      for (; v; ++b)
        d[b] = v, v >>>= 8;
    };
    fltn = function(d, p, t, o) {
      for (var k in d) {
        var val = d[k], n = p + k, op = o;
        if (Array.isArray(val))
          op = mrg(o, val[1]), val = val[0];
        if (ArrayBuffer.isView(val))
          t[n] = [val, op];
        else {
          t[n += "/"] = [new u8(0), op];
          fltn(val, n, t, o);
        }
      }
    };
    te = typeof TextEncoder != "undefined" && /* @__PURE__ */ new TextEncoder();
    td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
    tds = 0;
    try {
      td.decode(et, { stream: true });
      tds = 1;
    } catch (e) {
    }
    exfl = function(ex) {
      var le = 0;
      if (ex) {
        for (var k in ex) {
          var l = ex[k].length;
          if (l > 65535)
            err(9);
          le += l + 4;
        }
      }
      return le;
    };
    wzh = function(d, b, f, fn, u, c, ce, co) {
      var fl2 = fn.length, ex = f.extra, col = co && co.length;
      var exl = exfl(ex);
      wbytes(d, b, ce != null ? 33639248 : 67324752), b += 4;
      if (ce != null)
        d[b++] = 20, d[b++] = f.os;
      d[b] = 20, b += 2;
      d[b++] = f.flag << 1 | (c < 0 && 8), d[b++] = u && 8;
      d[b++] = f.compression & 255, d[b++] = f.compression >> 8;
      var dt = new Date(f.mtime == null ? Date.now() : f.mtime), y = dt.getFullYear() - 1980;
      if (y < 0 || y > 119)
        err(10);
      wbytes(d, b, y << 25 | dt.getMonth() + 1 << 21 | dt.getDate() << 16 | dt.getHours() << 11 | dt.getMinutes() << 5 | dt.getSeconds() >> 1), b += 4;
      if (c != -1) {
        wbytes(d, b, f.crc);
        wbytes(d, b + 4, c < 0 ? -c - 2 : c);
        wbytes(d, b + 8, f.size);
      }
      wbytes(d, b + 12, fl2);
      wbytes(d, b + 14, exl), b += 16;
      if (ce != null) {
        wbytes(d, b, col);
        wbytes(d, b + 6, f.attrs);
        wbytes(d, b + 10, ce), b += 14;
      }
      d.set(fn, b);
      b += fl2;
      if (exl) {
        for (var k in ex) {
          var exf = ex[k], l = exf.length;
          wbytes(d, b, +k);
          wbytes(d, b + 2, l);
          d.set(exf, b + 4), b += 4 + l;
        }
      }
      if (col)
        d.set(co, b), b += col;
      return b;
    };
    wzf = function(o, b, c, d, e) {
      wbytes(o, b, 101010256);
      wbytes(o, b + 8, c);
      wbytes(o, b + 10, c);
      wbytes(o, b + 12, d);
      wbytes(o, b + 16, e);
    };
  }
});

// node_modules/odf-kit/dist/core/namespaces.js
var ODF_NS, ODF_VERSION;
var init_namespaces = __esm({
  "node_modules/odf-kit/dist/core/namespaces.js"() {
    ODF_NS = {
      office: "urn:oasis:names:tc:opendocument:xmlns:office:1.0",
      style: "urn:oasis:names:tc:opendocument:xmlns:style:1.0",
      text: "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
      table: "urn:oasis:names:tc:opendocument:xmlns:table:1.0",
      draw: "urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
      fo: "urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",
      xlink: "http://www.w3.org/1999/xlink",
      dc: "http://purl.org/dc/elements/1.1/",
      meta: "urn:oasis:names:tc:opendocument:xmlns:meta:1.0",
      svg: "urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0",
      manifest: "urn:oasis:names:tc:opendocument:xmlns:manifest:1.0",
      number: "urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0"
    };
    ODF_VERSION = "1.2";
  }
});

// node_modules/odf-kit/dist/core/xml.js
function escapeXml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeAttr(value) {
  return escapeXml(value).replace(/"/g, "&quot;");
}
function el(tagName) {
  return new XmlElement(tagName);
}
function xmlDocument(root) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + root.serialize();
}
function xmlDocumentCompact(root) {
  return '<?xml version="1.0" encoding="UTF-8"?>' + root.serialize(0, true);
}
var XmlElement;
var init_xml = __esm({
  "node_modules/odf-kit/dist/core/xml.js"() {
    XmlElement = class {
      tagName;
      attributes = [];
      children = [];
      constructor(tagName) {
        this.tagName = tagName;
      }
      /** Set an attribute on this element. Returns this for chaining. */
      attr(name, value) {
        this.attributes.push([name, value]);
        return this;
      }
      /** Append a child element. Returns the child for further building. */
      appendChild(child) {
        this.children.push(child);
        return child;
      }
      /** Set the text content of this element. Returns this for chaining. */
      text(content) {
        this.children.push(content);
        return this;
      }
      /** Serialize this element and its children to an XML string. */
      serialize(indent = 0, compact = false) {
        const attrs = this.attributes.map(([k, v]) => ` ${k}="${escapeAttr(v)}"`).join("");
        if (this.children.length === 0) {
          return `<${this.tagName}${attrs}/>`;
        }
        if (this.children.length === 1 && typeof this.children[0] === "string") {
          return `<${this.tagName}${attrs}>${escapeXml(this.children[0])}</${this.tagName}>`;
        }
        if (compact) {
          const childStr2 = this.children.map((child) => {
            if (typeof child === "string") {
              return escapeXml(child);
            }
            return child.serialize(0, true);
          }).join("");
          return `<${this.tagName}${attrs}>${childStr2}</${this.tagName}>`;
        }
        const childStr = this.children.map((child) => {
          if (typeof child === "string") {
            return escapeXml(child);
          }
          return child.serialize(indent + 1);
        }).join("\n");
        return `<${this.tagName}${attrs}>
${childStr}
</${this.tagName}>`;
      }
    };
  }
});

// node_modules/odf-kit/dist/core/manifest.js
function generateManifest(rootMediaType, entries) {
  const root = el("manifest:manifest").attr("xmlns:manifest", ODF_NS.manifest).attr("manifest:version", ODF_VERSION);
  root.appendChild(el("manifest:file-entry").attr("manifest:media-type", rootMediaType).attr("manifest:full-path", "/"));
  for (const entry of entries) {
    root.appendChild(el("manifest:file-entry").attr("manifest:media-type", mediaTypeForPath(entry.fullPath, entry.mediaType)).attr("manifest:full-path", entry.fullPath));
  }
  return xmlDocument(root);
}
function mediaTypeForPath(path, explicit) {
  if (explicit)
    return explicit;
  if (path.endsWith(".xml"))
    return "text/xml";
  return "application/octet-stream";
}
var init_manifest = __esm({
  "node_modules/odf-kit/dist/core/manifest.js"() {
    init_namespaces();
    init_xml();
  }
});

// node_modules/odf-kit/dist/core/packaging.js
async function assemblePackage(mimeType, files) {
  const encoder = new TextEncoder();
  const zipData = {};
  zipData["mimetype"] = [encoder.encode(mimeType), { level: 0 }];
  for (const file of files) {
    const data = typeof file.content === "string" ? encoder.encode(file.content) : file.content;
    zipData[file.path] = [data, { level: 6 }];
  }
  const manifestEntries = files.map((f) => ({
    fullPath: f.path,
    mediaType: f.mediaType ?? (f.path.endsWith(".xml") ? "text/xml" : "application/octet-stream")
  }));
  const manifestXml = generateManifest(mimeType, manifestEntries);
  zipData["META-INF/manifest.xml"] = [encoder.encode(manifestXml), { level: 6 }];
  return zipSync(zipData);
}
var init_packaging = __esm({
  "node_modules/odf-kit/dist/core/packaging.js"() {
    init_browser();
    init_manifest();
  }
});

// node_modules/odf-kit/dist/core/metadata.js
function generateMeta(options = {}) {
  const root = el("office:document-meta").attr("xmlns:office", ODF_NS.office).attr("xmlns:meta", ODF_NS.meta).attr("xmlns:dc", ODF_NS.dc).attr("office:version", ODF_VERSION);
  const metaEl = el("office:meta");
  metaEl.appendChild(el("meta:generator").text("odf-kit"));
  const date = options.creationDate ?? /* @__PURE__ */ new Date();
  metaEl.appendChild(el("meta:creation-date").text(date.toISOString()));
  if (options.title) {
    metaEl.appendChild(el("dc:title").text(options.title));
  }
  if (options.description) {
    metaEl.appendChild(el("dc:description").text(options.description));
  }
  if (options.creator) {
    metaEl.appendChild(el("meta:initial-creator").text(options.creator));
  }
  root.appendChild(metaEl);
  return xmlDocument(root);
}
var init_metadata = __esm({
  "node_modules/odf-kit/dist/core/metadata.js"() {
    init_namespaces();
    init_xml();
  }
});

// node_modules/odf-kit/dist/core/styles.js
function buildStandardStyle() {
  const style = el("style:style").attr("style:name", "Standard").attr("style:family", "paragraph").attr("style:class", "text");
  style.appendChild(el("style:paragraph-properties").attr("fo:margin-bottom", "0.212cm"));
  style.appendChild(el("style:text-properties").attr("style:font-name", "Liberation Serif").attr("fo:font-size", "12pt").attr("style:font-name-asian", "Liberation Serif").attr("style:font-size-asian", "12pt").attr("style:font-name-complex", "Liberation Serif").attr("style:font-size-complex", "12pt"));
  return style;
}
function buildHeadingParentStyle() {
  const style = el("style:style").attr("style:name", "Heading").attr("style:family", "paragraph").attr("style:class", "chapter").attr("style:parent-style-name", "Standard").attr("style:next-style-name", "Standard");
  style.appendChild(el("style:paragraph-properties").attr("fo:keep-with-next", "always"));
  style.appendChild(el("style:text-properties").attr("fo:font-weight", "bold").attr("style:font-weight-asian", "bold").attr("style:font-weight-complex", "bold"));
  return style;
}
function buildHeadingStyle(def) {
  const style = el("style:style").attr("style:name", `Heading_20_${def.level}`).attr("style:display-name", `Heading ${def.level}`).attr("style:family", "paragraph").attr("style:class", "chapter").attr("style:parent-style-name", "Heading").attr("style:next-style-name", "Standard").attr("style:default-outline-level", String(def.level));
  style.appendChild(el("style:paragraph-properties").attr("fo:margin-top", def.marginTop).attr("fo:margin-bottom", def.marginBottom));
  style.appendChild(el("style:text-properties").attr("fo:font-size", def.fontSize).attr("style:font-size-asian", def.fontSize).attr("style:font-size-complex", def.fontSize));
  return style;
}
function buildListBulletStyle() {
  return el("style:style").attr("style:name", "List_20_Bullet").attr("style:display-name", "List Bullet").attr("style:family", "paragraph").attr("style:class", "list").attr("style:parent-style-name", "Standard");
}
function buildListNumberStyle() {
  return el("style:style").attr("style:name", "List_20_Number").attr("style:display-name", "List Number").attr("style:family", "paragraph").attr("style:class", "list").attr("style:parent-style-name", "Standard");
}
function buildHeaderStyle() {
  return el("style:style").attr("style:name", "Header").attr("style:family", "paragraph").attr("style:class", "extra").attr("style:parent-style-name", "Standard");
}
function buildFooterStyle() {
  return el("style:style").attr("style:name", "Footer").attr("style:family", "paragraph").attr("style:class", "extra").attr("style:parent-style-name", "Standard");
}
function appendNamedStyles(officeStyles) {
  officeStyles.appendChild(buildStandardStyle());
  officeStyles.appendChild(buildHeadingParentStyle());
  for (const def of HEADING_DEFS) {
    officeStyles.appendChild(buildHeadingStyle(def));
  }
  officeStyles.appendChild(buildListBulletStyle());
  officeStyles.appendChild(buildListNumberStyle());
  officeStyles.appendChild(buildHeaderStyle());
  officeStyles.appendChild(buildFooterStyle());
}
function generateStyles(config) {
  const root = el("office:document-styles").attr("xmlns:office", ODF_NS.office).attr("xmlns:style", ODF_NS.style).attr("xmlns:fo", ODF_NS.fo).attr("xmlns:text", ODF_NS.text).attr("xmlns:svg", ODF_NS.svg).attr("office:version", ODF_VERSION);
  const fontFaceDecls = el("office:font-face-decls");
  fontFaceDecls.appendChild(el("style:font-face").attr("style:name", "Liberation Serif").attr("svg:font-family", "'Liberation Serif'").attr("style:font-family-generic", "roman").attr("style:font-pitch", "variable"));
  root.appendChild(fontFaceDecls);
  const officeStyles = el("office:styles");
  appendNamedStyles(officeStyles);
  root.appendChild(officeStyles);
  const autoStyles = el("office:automatic-styles");
  const pl = config?.pageLayout;
  const pageLayout = el("style:page-layout").attr("style:name", "pm1");
  const pageProps = el("style:page-layout-properties").attr("fo:page-width", pl?.width ?? "21cm").attr("fo:page-height", pl?.height ?? "29.7cm").attr("style:print-orientation", pl?.orientation ?? "portrait").attr("fo:margin-top", pl?.marginTop ?? "2cm").attr("fo:margin-bottom", pl?.marginBottom ?? "2cm").attr("fo:margin-left", pl?.marginLeft ?? "2cm").attr("fo:margin-right", pl?.marginRight ?? "2cm");
  pageLayout.appendChild(pageProps);
  if (config?.headerParagraph) {
    const headerStyle = el("style:header-style");
    headerStyle.appendChild(el("style:header-footer-properties").attr("fo:min-height", "0.6cm").attr("fo:margin-bottom", "0.5cm"));
    pageLayout.appendChild(headerStyle);
  }
  if (config?.footerParagraph) {
    const footerStyle = el("style:footer-style");
    footerStyle.appendChild(el("style:header-footer-properties").attr("fo:min-height", "0.6cm").attr("fo:margin-top", "0.5cm"));
    pageLayout.appendChild(footerStyle);
  }
  autoStyles.appendChild(pageLayout);
  if (config?.headerFooterStyles) {
    for (const style of config.headerFooterStyles) {
      autoStyles.appendChild(style);
    }
  }
  root.appendChild(autoStyles);
  const masterStyles = el("office:master-styles");
  const masterPage = el("style:master-page").attr("style:name", "Default").attr("style:page-layout-name", "pm1");
  if (config?.headerParagraph) {
    const header = el("style:header");
    header.appendChild(config.headerParagraph);
    masterPage.appendChild(header);
  }
  if (config?.footerParagraph) {
    const footer = el("style:footer");
    footer.appendChild(config.footerParagraph);
    masterPage.appendChild(footer);
  }
  masterStyles.appendChild(masterPage);
  root.appendChild(masterStyles);
  return xmlDocument(root);
}
var HEADING_DEFS;
var init_styles = __esm({
  "node_modules/odf-kit/dist/core/styles.js"() {
    init_namespaces();
    init_xml();
    HEADING_DEFS = [
      { level: 1, fontSize: "28pt", marginTop: "0.423cm", marginBottom: "0.212cm" },
      { level: 2, fontSize: "24pt", marginTop: "0.353cm", marginBottom: "0.212cm" },
      { level: 3, fontSize: "20pt", marginTop: "0.247cm", marginBottom: "0.212cm" },
      { level: 4, fontSize: "14pt", marginTop: "0.212cm", marginBottom: "0.141cm" },
      { level: 5, fontSize: "13pt", marginTop: "0.212cm", marginBottom: "0.141cm" },
      { level: 6, fontSize: "12pt", marginTop: "0.212cm", marginBottom: "0.141cm" }
    ];
  }
});

// node_modules/odf-kit/dist/build-or-fill/build-odt/formatting.js
function normalizeFormatting(fmt) {
  const result = {};
  if (fmt.fontWeight !== void 0) {
    result.fontWeight = typeof fmt.fontWeight === "number" ? String(fmt.fontWeight) : fmt.fontWeight;
  } else if (fmt.bold !== void 0) {
    result.fontWeight = fmt.bold ? "bold" : "normal";
  }
  if (fmt.fontStyle !== void 0) {
    result.fontStyle = fmt.fontStyle;
  } else if (fmt.italic !== void 0) {
    result.fontStyle = fmt.italic ? "italic" : "normal";
  }
  if (fmt.fontSize !== void 0) {
    result.fontSize = typeof fmt.fontSize === "number" ? `${fmt.fontSize}pt` : fmt.fontSize;
  }
  if (fmt.fontFamily !== void 0) {
    result.fontFamily = fmt.fontFamily;
  }
  if (fmt.color !== void 0) {
    const lower = fmt.color.toLowerCase().trim();
    result.color = CSS_NAMED_COLORS[lower] ?? fmt.color;
  }
  if (fmt.underline) {
    result.underline = true;
  }
  if (fmt.strikethrough) {
    result.strikethrough = true;
  }
  if (fmt.superscript) {
    result.superscript = true;
  } else if (fmt.subscript) {
    result.subscript = true;
  }
  if (fmt.highlightColor !== void 0) {
    const lower = fmt.highlightColor.toLowerCase().trim();
    result.highlightColor = CSS_NAMED_COLORS[lower] ?? fmt.highlightColor;
  }
  if (fmt.textTransform !== void 0) {
    result.textTransform = fmt.textTransform;
  }
  if (fmt.smallCaps) {
    result.smallCaps = true;
  }
  return result;
}
function formattingKey(fmt) {
  const parts = [];
  if (fmt.fontWeight)
    parts.push(`w:${fmt.fontWeight}`);
  if (fmt.fontStyle)
    parts.push(`s:${fmt.fontStyle}`);
  if (fmt.fontSize)
    parts.push(`z:${fmt.fontSize}`);
  if (fmt.fontFamily)
    parts.push(`f:${fmt.fontFamily}`);
  if (fmt.color)
    parts.push(`c:${fmt.color}`);
  if (fmt.underline)
    parts.push("u:1");
  if (fmt.strikethrough)
    parts.push("st:1");
  if (fmt.superscript)
    parts.push("sup:1");
  if (fmt.subscript)
    parts.push("sub:1");
  if (fmt.highlightColor)
    parts.push(`hc:${fmt.highlightColor}`);
  if (fmt.textTransform)
    parts.push(`tt:${fmt.textTransform}`);
  if (fmt.smallCaps)
    parts.push("sc:1");
  return parts.join("|");
}
function resolveColor(color) {
  const lower = color.toLowerCase().trim();
  return CSS_NAMED_COLORS[lower] ?? color;
}
var CSS_NAMED_COLORS;
var init_formatting = __esm({
  "node_modules/odf-kit/dist/build-or-fill/build-odt/formatting.js"() {
    CSS_NAMED_COLORS = {
      black: "#000000",
      white: "#ffffff",
      red: "#ff0000",
      green: "#008000",
      blue: "#0000ff",
      yellow: "#ffff00",
      orange: "#ffa500",
      purple: "#800080",
      gray: "#808080",
      grey: "#808080",
      silver: "#c0c0c0",
      maroon: "#800000",
      olive: "#808000",
      lime: "#00ff00",
      aqua: "#00ffff",
      teal: "#008080",
      navy: "#000080",
      fuchsia: "#ff00ff",
      pink: "#ffc0cb",
      brown: "#a52a2a",
      coral: "#ff7f50",
      crimson: "#dc143c",
      darkblue: "#00008b",
      darkgreen: "#006400",
      darkred: "#8b0000",
      gold: "#ffd700",
      indigo: "#4b0082",
      ivory: "#fffff0",
      khaki: "#f0e68c",
      lavender: "#e6e6fa",
      magenta: "#ff00ff",
      salmon: "#fa8072",
      tan: "#d2b48c",
      turquoise: "#40e0d0",
      violet: "#ee82ee"
    };
  }
});

// node_modules/odf-kit/dist/build-or-fill/build-odt/content.js
function rowStyleKey(rs) {
  const parts = [];
  if (rs.backgroundColor)
    parts.push(`bg:${rs.backgroundColor}`);
  return parts.join("|");
}
function normalizeRowStyle(options) {
  const result = {};
  if (options?.backgroundColor) {
    result.backgroundColor = resolveColor(options.backgroundColor);
  }
  return result;
}
function cellStyleKey(cs) {
  const parts = [];
  if (cs.backgroundColor)
    parts.push(`bg:${cs.backgroundColor}`);
  if (cs.borderTop)
    parts.push(`bt:${cs.borderTop}`);
  if (cs.borderBottom)
    parts.push(`bb:${cs.borderBottom}`);
  if (cs.borderLeft)
    parts.push(`bl:${cs.borderLeft}`);
  if (cs.borderRight)
    parts.push(`br:${cs.borderRight}`);
  if (cs.verticalAlign)
    parts.push(`va:${cs.verticalAlign}`);
  if (cs.padding)
    parts.push(`p:${cs.padding}`);
  return parts.join("|");
}
function normalizeCellStyle(options, tableBorder) {
  const result = {};
  const defaultBorder = tableBorder;
  const cellBorder = options?.border ?? defaultBorder;
  result.borderTop = options?.borderTop ?? cellBorder;
  result.borderBottom = options?.borderBottom ?? cellBorder;
  result.borderLeft = options?.borderLeft ?? cellBorder;
  result.borderRight = options?.borderRight ?? cellBorder;
  if (options?.backgroundColor) {
    result.backgroundColor = resolveColor(options.backgroundColor);
  }
  if (options?.verticalAlign) {
    result.verticalAlign = options.verticalAlign;
  }
  if (options?.padding) {
    result.padding = options.padding;
  }
  if (!result.borderTop)
    delete result.borderTop;
  if (!result.borderBottom)
    delete result.borderBottom;
  if (!result.borderLeft)
    delete result.borderLeft;
  if (!result.borderRight)
    delete result.borderRight;
  return result;
}
function graphicStyleKey(gs) {
  const parts = [];
  if (gs.wrapMode)
    parts.push(`wrap:${gs.wrapMode}`);
  if (gs.marginTop)
    parts.push(`mt:${gs.marginTop}`);
  if (gs.marginBottom)
    parts.push(`mb:${gs.marginBottom}`);
  if (gs.marginLeft)
    parts.push(`ml:${gs.marginLeft}`);
  if (gs.marginRight)
    parts.push(`mr:${gs.marginRight}`);
  if (gs.border)
    parts.push(`border:${gs.border}`);
  if (gs.opacity !== void 0)
    parts.push(`opacity:${gs.opacity}`);
  return parts.join("|");
}
function normalizeGraphicStyle(image) {
  const result = {};
  if (image.wrapMode)
    result.wrapMode = image.wrapMode;
  const margin = image.margin;
  result.marginTop = image.marginTop ?? margin;
  result.marginBottom = image.marginBottom ?? margin;
  result.marginLeft = image.marginLeft ?? margin;
  result.marginRight = image.marginRight ?? margin;
  if (image.border)
    result.border = image.border;
  if (image.opacity !== void 0)
    result.opacity = image.opacity;
  if (!result.marginTop)
    delete result.marginTop;
  if (!result.marginBottom)
    delete result.marginBottom;
  if (!result.marginLeft)
    delete result.marginLeft;
  if (!result.marginRight)
    delete result.marginRight;
  return result;
}
function buildGraphicStyleMap(elements) {
  const map = /* @__PURE__ */ new Map();
  let counter = 1;
  function registerImage(image) {
    const normalized = normalizeGraphicStyle(image);
    const key = graphicStyleKey(normalized);
    if (key === "")
      return;
    if (!map.has(key)) {
      map.set(key, [`Gr${counter}`, normalized]);
      counter++;
    }
  }
  function registerRuns(runs) {
    for (const run of runs) {
      if (run.image)
        registerImage(run.image);
    }
  }
  for (const element of elements) {
    if (element.type === "image" && element.image) {
      registerImage(element.image);
    }
    if (element.runs) {
      registerRuns(element.runs);
    }
    if (element.type === "table" && element.table) {
      for (const row of element.table.rows) {
        for (const cell of row.cells) {
          registerRuns(cell.runs);
        }
      }
    }
    if (element.type === "list" && element.list) {
      for (const item of element.list.items) {
        registerRuns(item.runs);
      }
    }
  }
  return map;
}
function buildGraphicStyle(styleName, gs) {
  const style = el("style:style").attr("style:name", styleName).attr("style:family", "graphic").attr("style:parent-style-name", "Graphics");
  const props = el("style:graphic-properties");
  if (gs.wrapMode) {
    props.attr("style:wrap", gs.wrapMode);
  }
  if (gs.marginTop) {
    props.attr("fo:margin-top", gs.marginTop);
  }
  if (gs.marginBottom) {
    props.attr("fo:margin-bottom", gs.marginBottom);
  }
  if (gs.marginLeft) {
    props.attr("fo:margin-left", gs.marginLeft);
  }
  if (gs.marginRight) {
    props.attr("fo:margin-right", gs.marginRight);
  }
  if (gs.border) {
    props.attr("fo:border", gs.border);
  }
  if (gs.opacity !== void 0) {
    props.attr("draw:opacity", `${gs.opacity}%`);
  }
  style.appendChild(props);
  return style;
}
function generateContent(elements, imageMap) {
  const textStyleMap = buildTextStyleMap(elements);
  const cellStyleMap = buildCellStyleMap(elements);
  const rowStyleMap = buildRowStyleMap(elements);
  const paraStyleMap = buildParagraphStyleMap(elements);
  const graphicStyleMap = buildGraphicStyleMap(elements);
  let imageCounter = 1;
  const root = el("office:document-content").attr("xmlns:office", ODF_NS.office).attr("xmlns:style", ODF_NS.style).attr("xmlns:text", ODF_NS.text).attr("xmlns:table", ODF_NS.table).attr("xmlns:draw", ODF_NS.draw).attr("xmlns:fo", ODF_NS.fo).attr("xmlns:xlink", ODF_NS.xlink).attr("xmlns:svg", ODF_NS.svg).attr("office:version", ODF_VERSION);
  const fontFamilies = collectFontFamilies(textStyleMap);
  if (fontFamilies.size > 0) {
    const fontFaceDecls = el("office:font-face-decls");
    for (const fontFamily of fontFamilies) {
      const svgFontFamily = fontFamily.includes(" ") ? `'${fontFamily}'` : fontFamily;
      fontFaceDecls.appendChild(el("style:font-face").attr("style:name", fontFamily).attr("svg:font-family", svgFontFamily).attr("style:font-family-generic", "swiss").attr("style:font-pitch", "variable"));
    }
    root.appendChild(fontFaceDecls);
  }
  const autoStyles = el("office:automatic-styles");
  for (const [styleName, fmt] of textStyleMap.values()) {
    autoStyles.appendChild(buildTextStyle(styleName, fmt));
  }
  for (const [styleName, opts, parentStyle] of paraStyleMap.values()) {
    autoStyles.appendChild(buildParagraphStyle(styleName, opts, parentStyle));
  }
  let tableCounter = 1;
  for (const element of elements) {
    if (element.type === "table" && element.table) {
      const tableName = `Table${tableCounter}`;
      appendTableStyles(autoStyles, tableName, element.table);
      tableCounter++;
    }
  }
  for (const [styleName, cs] of cellStyleMap.values()) {
    autoStyles.appendChild(buildCellStyle(styleName, cs));
  }
  for (const [styleName, rs] of rowStyleMap.values()) {
    autoStyles.appendChild(buildRowStyle(styleName, rs));
  }
  for (const [styleName, gs] of graphicStyleMap.values()) {
    autoStyles.appendChild(buildGraphicStyle(styleName, gs));
  }
  let listCounter = 1;
  for (const element of elements) {
    if (element.type === "list" && element.list) {
      const listName = `L${listCounter}`;
      autoStyles.appendChild(buildListStyle(listName, element.list));
      listCounter++;
    }
  }
  const hasPageBreak = elements.some((e) => e.type === "page-break");
  if (hasPageBreak) {
    const pbStyle = el("style:style").attr("style:name", "PageBreak").attr("style:family", "paragraph").attr("style:parent-style-name", "Standard");
    pbStyle.appendChild(el("style:paragraph-properties").attr("fo:break-before", "page"));
    autoStyles.appendChild(pbStyle);
  }
  root.appendChild(autoStyles);
  const body = el("office:body");
  const textContainer = el("office:text");
  tableCounter = 1;
  listCounter = 1;
  for (const element of elements) {
    switch (element.type) {
      case "paragraph": {
        const styleName = resolveParagraphStyleName(element, "Standard", paraStyleMap);
        const p = el("text:p").attr("text:style-name", styleName);
        imageCounter = appendRuns(p, element.runs ?? [], textStyleMap, imageMap, imageCounter, graphicStyleMap);
        textContainer.appendChild(p);
        break;
      }
      case "heading": {
        const level = element.level ?? 1;
        const defaultStyleName = `Heading_20_${level}`;
        const styleName = resolveParagraphStyleName(element, defaultStyleName, paraStyleMap);
        const h = el("text:h").attr("text:style-name", styleName).attr("text:outline-level", String(level));
        imageCounter = appendRuns(h, element.runs ?? [], textStyleMap, imageMap, imageCounter, graphicStyleMap);
        textContainer.appendChild(h);
        break;
      }
      case "table": {
        if (element.table) {
          const tableName = `Table${tableCounter}`;
          textContainer.appendChild(buildTableElement(tableName, element.table, textStyleMap, cellStyleMap, rowStyleMap, imageMap, imageCounter, graphicStyleMap));
          imageCounter += countImagesInTable(element.table);
          tableCounter++;
        }
        break;
      }
      case "list": {
        if (element.list) {
          const listName = `L${listCounter}`;
          textContainer.appendChild(buildListElement(listName, element.list, textStyleMap, imageMap, imageCounter, graphicStyleMap));
          imageCounter += countImagesInList(element.list);
          listCounter++;
        }
        break;
      }
      case "page-break": {
        textContainer.appendChild(el("text:p").attr("text:style-name", "PageBreak"));
        break;
      }
      case "image": {
        if (element.image && imageMap) {
          const p = el("text:p").attr("text:style-name", "Standard");
          p.appendChild(buildImageFrame(element.image, imageMap, imageCounter, graphicStyleMap));
          imageCounter++;
          textContainer.appendChild(p);
        }
        break;
      }
    }
  }
  body.appendChild(textContainer);
  root.appendChild(body);
  return xmlDocument(root);
}
function buildTextStyleMap(elements) {
  const map = /* @__PURE__ */ new Map();
  let counter = 1;
  function registerRuns(runs) {
    for (const run of runs) {
      if (!run.formatting)
        continue;
      const normalized = normalizeFormatting(run.formatting);
      const key = formattingKey(normalized);
      if (key === "")
        continue;
      if (!map.has(key)) {
        map.set(key, [`T${counter}`, normalized]);
        counter++;
      }
    }
  }
  function registerListItems(items) {
    for (const item of items) {
      registerRuns(item.runs);
      if (item.nested) {
        registerListItems(item.nested.items);
      }
    }
  }
  for (const element of elements) {
    if (element.runs) {
      registerRuns(element.runs);
    }
    if (element.type === "table" && element.table) {
      for (const row of element.table.rows) {
        for (const cell of row.cells) {
          registerRuns(cell.runs);
        }
      }
    }
    if (element.type === "list" && element.list) {
      registerListItems(element.list.items);
    }
  }
  return map;
}
function collectFontFamilies(textStyleMap) {
  const families = /* @__PURE__ */ new Set();
  for (const [, fmt] of textStyleMap.values()) {
    if (fmt.fontFamily)
      families.add(fmt.fontFamily);
  }
  return families;
}
function buildRowStyleMap(elements) {
  const map = /* @__PURE__ */ new Map();
  let counter = 1;
  for (const element of elements) {
    if (element.type !== "table" || !element.table)
      continue;
    for (const row of element.table.rows) {
      const normalized = normalizeRowStyle(row.options);
      const key = rowStyleKey(normalized);
      if (key === "")
        continue;
      if (!map.has(key)) {
        map.set(key, [`R${counter}`, normalized]);
        counter++;
      }
    }
  }
  return map;
}
function buildCellStyleMap(elements) {
  const map = /* @__PURE__ */ new Map();
  let counter = 1;
  for (const element of elements) {
    if (element.type !== "table" || !element.table)
      continue;
    const tableBorder = element.table.options?.border;
    for (const row of element.table.rows) {
      for (const cell of row.cells) {
        const normalized = normalizeCellStyle(cell.options, tableBorder);
        const key = cellStyleKey(normalized);
        if (key === "")
          continue;
        if (!map.has(key)) {
          map.set(key, [`C${counter}`, normalized]);
          counter++;
        }
      }
    }
  }
  return map;
}
function appendTableStyles(autoStyles, tableName, table) {
  const tableStyle = el("style:style").attr("style:name", tableName).attr("style:family", "table");
  const tableProps = el("style:table-properties").attr("table:align", "margins");
  tableStyle.appendChild(tableProps);
  autoStyles.appendChild(tableStyle);
  const widths = table.options?.columnWidths;
  if (widths) {
    for (let i2 = 0; i2 < widths.length; i2++) {
      const colLetter = String.fromCharCode(65 + i2);
      const colStyle = el("style:style").attr("style:name", `${tableName}.${colLetter}`).attr("style:family", "table-column");
      const colProps = el("style:table-column-properties").attr("style:column-width", widths[i2]);
      colStyle.appendChild(colProps);
      autoStyles.appendChild(colStyle);
    }
  }
}
function buildRowStyle(styleName, rs) {
  const style = el("style:style").attr("style:name", styleName).attr("style:family", "table-row");
  const props = el("style:table-row-properties");
  if (rs.backgroundColor) {
    props.attr("fo:background-color", rs.backgroundColor);
  }
  style.appendChild(props);
  return style;
}
function buildCellStyle(styleName, cs) {
  const style = el("style:style").attr("style:name", styleName).attr("style:family", "table-cell");
  const props = el("style:table-cell-properties");
  if (cs.backgroundColor) {
    props.attr("fo:background-color", cs.backgroundColor);
  }
  if (cs.borderTop) {
    props.attr("fo:border-top", cs.borderTop);
  }
  if (cs.borderBottom) {
    props.attr("fo:border-bottom", cs.borderBottom);
  }
  if (cs.borderLeft) {
    props.attr("fo:border-left", cs.borderLeft);
  }
  if (cs.borderRight) {
    props.attr("fo:border-right", cs.borderRight);
  }
  if (cs.verticalAlign) {
    props.attr("style:vertical-align", cs.verticalAlign);
  }
  if (cs.padding) {
    props.attr("fo:padding", cs.padding);
  }
  style.appendChild(props);
  return style;
}
function buildTableElement(tableName, table, textStyleMap, cellStyleMap, rowStyleMap, imageMap, imageCounterStart, graphicStyleMap = /* @__PURE__ */ new Map()) {
  let imageCounter = imageCounterStart ?? 1;
  const tableEl = el("table:table").attr("table:name", tableName).attr("table:style-name", tableName);
  const numCols = getColumnCount(table);
  const widths = table.options?.columnWidths;
  if (widths) {
    for (let i2 = 0; i2 < Math.max(widths.length, numCols); i2++) {
      if (i2 < widths.length) {
        tableEl.appendChild(el("table:table-column").attr("table:style-name", `${tableName}.${String.fromCharCode(65 + i2)}`));
      } else {
        tableEl.appendChild(el("table:table-column"));
      }
    }
  } else if (numCols > 0) {
    tableEl.appendChild(el("table:table-column").attr("table:number-columns-repeated", String(numCols)));
  }
  const covered = buildCoverageMap(table);
  const tableBorder = table.options?.border;
  for (let rowIdx = 0; rowIdx < table.rows.length; rowIdx++) {
    const row = table.rows[rowIdx];
    const rowEl = el("table:table-row");
    const normalizedRow = normalizeRowStyle(row.options);
    const rsKey = rowStyleKey(normalizedRow);
    if (rsKey !== "") {
      const entry = rowStyleMap.get(rsKey);
      if (entry)
        rowEl.attr("table:style-name", entry[0]);
    }
    let logicalCol = 0;
    for (const cell of row.cells) {
      while (covered.has(`${rowIdx},${logicalCol}`)) {
        rowEl.appendChild(el("table:covered-table-cell"));
        logicalCol++;
      }
      if (cell.runs.length === 0 && !cell.options) {
        rowEl.appendChild(el("table:table-cell").appendChild(el("text:p").attr("text:style-name", "Standard")));
        logicalCol++;
        continue;
      }
      const cellEl = el("table:table-cell");
      const normalizedCell = normalizeCellStyle(cell.options, tableBorder);
      const csKey = cellStyleKey(normalizedCell);
      if (csKey !== "") {
        const entry = cellStyleMap.get(csKey);
        cellEl.attr("table:style-name", entry[0]);
      }
      const colSpan = cell.options?.colSpan ?? 1;
      if (colSpan > 1) {
        cellEl.attr("table:number-columns-spanned", String(colSpan));
      }
      const rowSpan = cell.options?.rowSpan ?? 1;
      if (rowSpan > 1) {
        cellEl.attr("table:number-rows-spanned", String(rowSpan));
      }
      const p = el("text:p").attr("text:style-name", "Standard");
      imageCounter = appendRuns(p, cell.runs, textStyleMap, imageMap, imageCounter, graphicStyleMap);
      cellEl.appendChild(p);
      rowEl.appendChild(cellEl);
      logicalCol += colSpan;
      for (let s = 1; s < colSpan; s++) {
        rowEl.appendChild(el("table:covered-table-cell"));
      }
    }
    tableEl.appendChild(rowEl);
  }
  return tableEl;
}
function getColumnCount(table) {
  let maxCols = 0;
  for (const row of table.rows) {
    let cols = 0;
    for (const cell of row.cells) {
      cols += cell.options?.colSpan ?? 1;
    }
    maxCols = Math.max(maxCols, cols);
  }
  if (table.options?.columnWidths) {
    maxCols = Math.max(maxCols, table.options.columnWidths.length);
  }
  return maxCols;
}
function buildCoverageMap(table) {
  const covered = /* @__PURE__ */ new Set();
  for (let rowIdx = 0; rowIdx < table.rows.length; rowIdx++) {
    const row = table.rows[rowIdx];
    let colIdx = 0;
    for (const cell of row.cells) {
      while (covered.has(`${rowIdx},${colIdx}`)) {
        colIdx++;
      }
      const colSpan = cell.options?.colSpan ?? 1;
      const rowSpan = cell.options?.rowSpan ?? 1;
      for (let r = 0; r < rowSpan; r++) {
        for (let c = 0; c < colSpan; c++) {
          if (r === 0 && c === 0)
            continue;
          covered.add(`${rowIdx + r},${colIdx + c}`);
        }
      }
      colIdx += colSpan;
    }
  }
  return covered;
}
function appendRuns(parent, runs, styleMap, imageMap, imageCounter = 1, graphicStyleMap = /* @__PURE__ */ new Map()) {
  for (const run of runs) {
    if (run.lineBreak) {
      parent.appendChild(el("text:line-break"));
      continue;
    }
    if (run.field === "tab") {
      parent.appendChild(el("text:tab"));
      continue;
    }
    if (run.field === "page-number") {
      const pageNum = el("text:page-number").attr("text:select-page", "current").text(run.text);
      if (run.formatting) {
        const normalized = normalizeFormatting(run.formatting);
        const key = formattingKey(normalized);
        if (key !== "") {
          const entry = styleMap.get(key);
          const span = el("text:span").attr("text:style-name", entry[0]);
          span.appendChild(pageNum);
          parent.appendChild(span);
          continue;
        }
      }
      parent.appendChild(pageNum);
      continue;
    }
    if (run.bookmark) {
      parent.appendChild(el("text:bookmark").attr("text:name", run.bookmark));
      if (run.text) {
        parent.text(run.text);
      }
      continue;
    }
    if (run.image) {
      if (imageMap) {
        parent.appendChild(buildImageFrame(run.image, imageMap, imageCounter, graphicStyleMap));
        imageCounter++;
      }
      continue;
    }
    if (run.link) {
      const linkEl = el("text:a").attr("xlink:type", "simple").attr("xlink:href", run.link);
      if (run.formatting) {
        const normalized = normalizeFormatting(run.formatting);
        const key = formattingKey(normalized);
        if (key !== "") {
          const entry = styleMap.get(key);
          linkEl.appendChild(el("text:span").attr("text:style-name", entry[0]).text(run.text));
        } else {
          linkEl.text(run.text);
        }
      } else {
        linkEl.text(run.text);
      }
      parent.appendChild(linkEl);
      continue;
    }
    if (!run.formatting) {
      parent.text(run.text);
    } else {
      const normalized = normalizeFormatting(run.formatting);
      const key = formattingKey(normalized);
      if (key === "") {
        parent.text(run.text);
      } else {
        const entry = styleMap.get(key);
        const styleName = entry[0];
        parent.appendChild(el("text:span").attr("text:style-name", styleName).text(run.text));
      }
    }
  }
  return imageCounter;
}
function buildTextStyle(styleName, fmt) {
  const style = el("style:style").attr("style:name", styleName).attr("style:family", "text");
  const props = el("style:text-properties");
  if (fmt.fontWeight) {
    props.attr("fo:font-weight", fmt.fontWeight);
    props.attr("style:font-weight-asian", fmt.fontWeight);
    props.attr("style:font-weight-complex", fmt.fontWeight);
  }
  if (fmt.fontStyle) {
    props.attr("fo:font-style", fmt.fontStyle);
    props.attr("style:font-style-asian", fmt.fontStyle);
    props.attr("style:font-style-complex", fmt.fontStyle);
  }
  if (fmt.fontSize) {
    props.attr("fo:font-size", fmt.fontSize);
    props.attr("style:font-size-asian", fmt.fontSize);
    props.attr("style:font-size-complex", fmt.fontSize);
  }
  if (fmt.fontFamily) {
    props.attr("style:font-name", fmt.fontFamily);
    props.attr("fo:font-family", fmt.fontFamily);
    props.attr("style:font-name-asian", fmt.fontFamily);
    props.attr("style:font-name-complex", fmt.fontFamily);
  }
  if (fmt.color) {
    props.attr("fo:color", fmt.color);
  }
  if (fmt.underline) {
    props.attr("style:text-underline-style", "solid");
    props.attr("style:text-underline-width", "auto");
    props.attr("style:text-underline-color", "font-color");
  }
  if (fmt.strikethrough) {
    props.attr("style:text-line-through-style", "solid");
  }
  if (fmt.superscript) {
    props.attr("style:text-position", "super 58%");
  }
  if (fmt.subscript) {
    props.attr("style:text-position", "sub 58%");
  }
  if (fmt.highlightColor) {
    props.attr("fo:background-color", fmt.highlightColor);
  }
  if (fmt.textTransform) {
    props.attr("fo:text-transform", fmt.textTransform);
  }
  if (fmt.smallCaps) {
    props.attr("fo:font-variant", "small-caps");
  }
  style.appendChild(props);
  return style;
}
function normalizeLineHeight(lineHeight) {
  if (typeof lineHeight === "number") {
    return `${Math.round(lineHeight * 100)}%`;
  }
  return lineHeight;
}
function hasParagraphOptions(opts) {
  if (!opts)
    return false;
  return !!(opts.align || opts.spaceBefore || opts.spaceAfter || opts.lineHeight !== void 0 || opts.writingMode || opts.indentLeft || opts.indentFirst || opts.borderBottom || opts.tabStops && opts.tabStops.length > 0);
}
function paragraphOptionsKey(opts) {
  const parts = [];
  if (opts.align)
    parts.push(`a:${opts.align}`);
  if (opts.spaceBefore)
    parts.push(`sb:${opts.spaceBefore}`);
  if (opts.spaceAfter)
    parts.push(`sa:${opts.spaceAfter}`);
  if (opts.lineHeight !== void 0)
    parts.push(`lh:${opts.lineHeight}`);
  if (opts.writingMode)
    parts.push(`wm:${opts.writingMode}`);
  if (opts.indentLeft)
    parts.push(`il:${opts.indentLeft}`);
  if (opts.indentFirst)
    parts.push(`if:${opts.indentFirst}`);
  if (opts.borderBottom)
    parts.push(`bdb:${opts.borderBottom}`);
  if (opts.tabStops && opts.tabStops.length > 0) {
    parts.push(`ts:${tabStopsKey(opts.tabStops)}`);
  }
  return parts.join("|");
}
function tabStopsKey(tabStops) {
  return tabStops.map((ts) => `${ts.position}:${ts.type ?? "left"}`).join("|");
}
function buildParagraphStyleMap(elements) {
  const map = /* @__PURE__ */ new Map();
  let counter = 1;
  function register(opts, parentStyle) {
    const optsKey = paragraphOptionsKey(opts);
    const mapKey = `${parentStyle}|${optsKey}`;
    if (!map.has(mapKey)) {
      map.set(mapKey, [`P${counter}`, opts, parentStyle]);
      counter++;
    }
  }
  for (const element of elements) {
    if (!hasParagraphOptions(element.paragraphOptions))
      continue;
    if (element.type === "paragraph") {
      register(element.paragraphOptions, "Standard");
    } else if (element.type === "heading") {
      const level = element.level ?? 1;
      register(element.paragraphOptions, `Heading_20_${level}`);
    }
  }
  return map;
}
function buildParagraphStyle(styleName, opts, parentStyle) {
  const style = el("style:style").attr("style:name", styleName).attr("style:family", "paragraph").attr("style:parent-style-name", parentStyle);
  const paraProps = el("style:paragraph-properties");
  let hasParaProps = false;
  if (opts.align) {
    paraProps.attr("fo:text-align", opts.align);
    hasParaProps = true;
  }
  if (opts.spaceBefore) {
    paraProps.attr("fo:margin-top", opts.spaceBefore);
    hasParaProps = true;
  }
  if (opts.spaceAfter) {
    paraProps.attr("fo:margin-bottom", opts.spaceAfter);
    hasParaProps = true;
  }
  if (opts.lineHeight !== void 0) {
    paraProps.attr("fo:line-height", normalizeLineHeight(opts.lineHeight));
    hasParaProps = true;
  }
  if (opts.writingMode) {
    paraProps.attr("style:writing-mode", opts.writingMode);
    hasParaProps = true;
  }
  if (opts.indentLeft) {
    paraProps.attr("fo:margin-left", opts.indentLeft);
    hasParaProps = true;
  }
  if (opts.indentFirst) {
    paraProps.attr("fo:text-indent", opts.indentFirst);
    hasParaProps = true;
  }
  if (opts.borderBottom) {
    paraProps.attr("fo:border-bottom", opts.borderBottom);
    hasParaProps = true;
  }
  if (opts.tabStops && opts.tabStops.length > 0) {
    const tabStopsEl = el("style:tab-stops");
    for (const ts of opts.tabStops) {
      tabStopsEl.appendChild(el("style:tab-stop").attr("style:position", ts.position).attr("style:type", ts.type ?? "left"));
    }
    paraProps.appendChild(tabStopsEl);
    hasParaProps = true;
  }
  if (hasParaProps) {
    style.appendChild(paraProps);
  }
  return style;
}
function resolveParagraphStyleName(element, defaultStyleName, paraStyleMap) {
  if (!hasParagraphOptions(element.paragraphOptions))
    return defaultStyleName;
  const optsKey = paragraphOptionsKey(element.paragraphOptions);
  const mapKey = `${defaultStyleName}|${optsKey}`;
  const entry = paraStyleMap.get(mapKey);
  return entry ? entry[0] : defaultStyleName;
}
function buildListStyle(styleName, list) {
  const isBullet = (list.options?.type ?? "bullet") === "bullet";
  const listStyle = el("text:list-style").attr("style:name", styleName);
  const maxLevel = 6;
  for (let level = 1; level <= maxLevel; level++) {
    const indent = level * 0.635;
    const marginLeft = `${(indent * 2).toFixed(3)}cm`;
    const textIndent = `-${indent.toFixed(3)}cm`;
    if (isBullet) {
      const bulletEl = el("text:list-level-style-bullet").attr("text:level", String(level)).attr("text:bullet-char", BULLET_CHARS[(level - 1) % BULLET_CHARS.length]);
      const levelProps = el("style:list-level-properties").attr("text:list-level-position-and-space-mode", "label-alignment");
      levelProps.appendChild(el("style:list-level-label-alignment").attr("text:label-followed-by", "listtab").attr("text:list-tab-stop-position", marginLeft).attr("fo:text-indent", textIndent).attr("fo:margin-left", marginLeft));
      bulletEl.appendChild(levelProps);
      listStyle.appendChild(bulletEl);
    } else {
      const numFormat = list.options?.numFormat ?? "1";
      const numSuffix = list.options?.numSuffix ?? ".";
      const numberEl = el("text:list-level-style-number").attr("text:level", String(level)).attr("style:num-format", numFormat).attr("style:num-suffix", numSuffix);
      if (list.options?.numPrefix) {
        numberEl.attr("style:num-prefix", list.options.numPrefix);
      }
      const levelProps = el("style:list-level-properties").attr("text:list-level-position-and-space-mode", "label-alignment");
      levelProps.appendChild(el("style:list-level-label-alignment").attr("text:label-followed-by", "listtab").attr("text:list-tab-stop-position", marginLeft).attr("fo:text-indent", textIndent).attr("fo:margin-left", marginLeft));
      numberEl.appendChild(levelProps);
      listStyle.appendChild(numberEl);
    }
  }
  return listStyle;
}
function buildListElement(styleName, list, textStyleMap, imageMap, imageCounterStart, graphicStyleMap = /* @__PURE__ */ new Map()) {
  const isBullet = (list.options?.type ?? "bullet") === "bullet";
  const paraStyleName = isBullet ? "List_20_Bullet" : "List_20_Number";
  const startValue = !isBullet ? list.options?.startValue : void 0;
  let imageCounter = imageCounterStart ?? 1;
  let isFirstItem = true;
  const listEl = el("text:list").attr("text:style-name", styleName);
  function appendItems(parentEl, items, isRoot) {
    for (const item of items) {
      const itemEl = el("text:list-item");
      if (isRoot && isFirstItem && startValue !== void 0) {
        itemEl.attr("text:start-value", String(startValue));
        isFirstItem = false;
      } else if (isRoot) {
        isFirstItem = false;
      }
      const p = el("text:p").attr("text:style-name", paraStyleName);
      imageCounter = appendRuns(p, item.runs, textStyleMap, imageMap, imageCounter, graphicStyleMap);
      itemEl.appendChild(p);
      if (item.nested) {
        const subList = el("text:list");
        appendItems(subList, item.nested.items, false);
        itemEl.appendChild(subList);
      }
      parentEl.appendChild(itemEl);
    }
  }
  appendItems(listEl, list.items, true);
  return listEl;
}
function buildImageFrame(image, imageMap, imageCounter, graphicStyleMap) {
  const imagePath = imageMap.get(image);
  if (!imagePath) {
    throw new Error("Image not found in imageMap \u2014 this is an internal error.");
  }
  const frame = el("draw:frame").attr("draw:name", image.name ?? `Image${imageCounter}`).attr("text:anchor-type", image.anchor);
  if (image.width)
    frame.attr("svg:width", image.width);
  if (image.height)
    frame.attr("svg:height", image.height);
  const gsKey = graphicStyleKey(normalizeGraphicStyle(image));
  if (gsKey !== "") {
    const entry = graphicStyleMap.get(gsKey);
    if (entry) {
      frame.attr("draw:style-name", entry[0]);
    }
  }
  if (image.alt) {
    frame.appendChild(el("svg:title").text(image.alt));
  }
  if (image.description) {
    frame.appendChild(el("svg:desc").text(image.description));
  }
  const drawImage = el("draw:image").attr("xlink:href", imagePath).attr("xlink:type", "simple").attr("xlink:show", "embed").attr("xlink:actuate", "onLoad");
  frame.appendChild(drawImage);
  return frame;
}
function countImagesInRuns(runs) {
  let count = 0;
  for (const run of runs) {
    if (run.image)
      count++;
  }
  return count;
}
function countImagesInTable(table) {
  let count = 0;
  for (const row of table.rows) {
    for (const cell of row.cells) {
      count += countImagesInRuns(cell.runs);
    }
  }
  return count;
}
function countImagesInList(list) {
  let count = 0;
  function countItems(items) {
    for (const item of items) {
      count += countImagesInRuns(item.runs);
      if (item.nested)
        countItems(item.nested.items);
    }
  }
  countItems(list.items);
  return count;
}
function buildHeaderFooterContent(runs, styleName, stylePrefix) {
  const styleMap = /* @__PURE__ */ new Map();
  let counter = 1;
  for (const run of runs) {
    if (!run.formatting)
      continue;
    const normalized = normalizeFormatting(run.formatting);
    const key = formattingKey(normalized);
    if (key === "" || styleMap.has(key))
      continue;
    styleMap.set(key, [`${stylePrefix}${counter}`, normalized]);
    counter++;
  }
  const p = el("text:p").attr("text:style-name", styleName);
  appendRuns(p, runs, styleMap);
  const styles = [];
  for (const [name, fmt] of styleMap.values()) {
    styles.push(buildTextStyle(name, fmt));
  }
  return { paragraph: p, styles };
}
var BULLET_CHARS;
var init_content = __esm({
  "node_modules/odf-kit/dist/build-or-fill/build-odt/content.js"() {
    init_namespaces();
    init_xml();
    init_formatting();
    BULLET_CHARS = ["\u2022", "\u25E6", "\u25AA", "\u25B8", "\u2013", "\xB7"];
  }
});

// node_modules/odf-kit/dist/build-or-fill/build-odt/paragraph-builder.js
var ParagraphBuilder;
var init_paragraph_builder = __esm({
  "node_modules/odf-kit/dist/build-or-fill/build-odt/paragraph-builder.js"() {
    ParagraphBuilder = class {
      /** @internal */
      runs = [];
      /**
       * Add a run of text with optional formatting.
       *
       * @param text - The text content.
       * @param formatting - Optional formatting for this run.
       * @returns This builder, for chaining.
       *
       * @example
       * p.addText("hello");
       * p.addText("bold", { bold: true });
       * p.addText("big red", { fontSize: 24, color: "#FF0000" });
       */
      addText(text, formatting) {
        this.runs.push({ text, formatting });
        return this;
      }
      /**
       * Insert a tab character. Use with `tabStops` in paragraph options
       * to control tab positions.
       *
       * @returns This builder, for chaining.
       *
       * @example
       * p.addText("Name");
       * p.addTab();
       * p.addText("Value");
       */
      addTab() {
        this.runs.push({ text: "", field: "tab" });
        return this;
      }
      /**
       * Add a hyperlink.
       *
       * Use a URL for external links, or `"#bookmarkName"` for internal links
       * to bookmarks created with `addBookmark()`.
       *
       * @param text - The visible link text.
       * @param url - The link target (URL or `"#bookmarkName"`).
       * @param formatting - Optional text formatting for the link.
       * @returns This builder, for chaining.
       *
       * @example
       * p.addLink("our website", "https://example.com");
       * p.addLink("Click here", "https://example.com", { bold: true, color: "blue" });
       * p.addLink("Chapter 2", "#chapter2");
       */
      addLink(text, url, formatting) {
        this.runs.push({ text, formatting, link: url });
        return this;
      }
      /**
       * Insert a bookmark at the current position in the text flow.
       *
       * Bookmarks can be linked to from elsewhere in the document using
       * `addLink("text", "#bookmarkName")`.
       *
       * @param name - The bookmark name (used in `#name` links).
       * @returns This builder, for chaining.
       *
       * @example
       * p.addBookmark("chapter1");
       * p.addText("Chapter 1 content...");
       */
      addBookmark(name) {
        this.runs.push({ text: "", bookmark: name });
        return this;
      }
      /**
       * Insert an inline image at the current position.
       *
       * The image is anchored as a character in the text flow by default.
       *
       * @param data - The raw image bytes as a Uint8Array.
       * @param options - Image options (width, height, mimeType are required).
       * @returns This builder, for chaining.
       *
       * @example
       * p.addImage(pngBytes, { width: "5cm", height: "3cm", mimeType: "image/png" });
       */
      addImage(data, options) {
        const imageData = {
          data,
          width: options.width,
          height: options.height,
          mimeType: options.mimeType,
          anchor: options.anchor ?? "as-character",
          alt: options.alt,
          description: options.description,
          name: options.name,
          wrapMode: options.wrapMode,
          margin: options.margin,
          marginTop: options.marginTop,
          marginBottom: options.marginBottom,
          marginLeft: options.marginLeft,
          marginRight: options.marginRight,
          border: options.border,
          opacity: options.opacity
        };
        this.runs.push({ text: "", image: imageData });
        return this;
      }
      /**
       * Insert a line break at the current position.
       *
       * Equivalent to `<br>` in HTML — a soft line break within the same paragraph.
       * The word processor renders subsequent text on the next line without starting
       * a new paragraph.
       *
       * @returns This builder, for chaining.
       *
       * @example
       * doc.addParagraph((p) => {
       *   p.addText("Line one");
       *   p.addLineBreak();
       *   p.addText("Line two");
       * });
       */
      addLineBreak() {
        this.runs.push({ text: "", lineBreak: true });
        return this;
      }
    };
  }
});

// node_modules/odf-kit/dist/build-or-fill/build-odt/header-footer-builder.js
var HeaderFooterBuilder;
var init_header_footer_builder = __esm({
  "node_modules/odf-kit/dist/build-or-fill/build-odt/header-footer-builder.js"() {
    HeaderFooterBuilder = class {
      /** @internal */
      runs = [];
      /**
       * Add a run of text with optional formatting.
       *
       * @param text - The text content.
       * @param formatting - Optional formatting for this run.
       * @returns This builder, for chaining.
       */
      addText(text, formatting) {
        this.runs.push({ text, formatting });
        return this;
      }
      /**
       * Insert the current page number.
       *
       * @param formatting - Optional formatting for the page number.
       * @returns This builder, for chaining.
       *
       * @example
       * f.addText("Page ");
       * f.addPageNumber();
       *
       * @example
       * f.addPageNumber({ bold: true, fontSize: 10 });
       */
      addPageNumber(formatting) {
        this.runs.push({ text: "#", field: "page-number", formatting });
        return this;
      }
    };
  }
});

// node_modules/odf-kit/dist/core/length.js
function excerpt(s) {
  return s.length > MAX_NUMERIC_LEXICAL ? `${s.slice(0, MAX_NUMERIC_LEXICAL)}\u2026` : s;
}
function gcd(a, b) {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
}
function rat(n, d) {
  if (d === 0n)
    throw new Error("length core: zero denominator");
  if (d < 0n) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d) || 1n;
  return { n: n / g, d: d / g };
}
function mul(a, b) {
  return rat(a.n * b.n, a.d * b.d);
}
function div(a, b) {
  if (b.n === 0n)
    throw new Error("length core: division by zero");
  return rat(a.n * b.d, a.d * b.n);
}
function sub(a, b) {
  return rat(a.n * b.d - b.n * a.d, a.d * b.d);
}
function cmpRational(a, b) {
  const l = a.n * b.d;
  const r = b.n * a.d;
  return l < r ? -1 : l > r ? 1 : 0;
}
function floorDiv(a, b) {
  const q = a / b;
  return a % b !== 0n && a < 0n ? q - 1n : q;
}
function ceilDiv(a, b) {
  const q = a / b;
  return a % b !== 0n && a > 0n ? q + 1n : q;
}
function parseDecimal(raw) {
  if (raw.length > MAX_NUMERIC_LEXICAL)
    return void 0;
  const m = /^([-+]?)(\d+)?(?:\.(\d+))?$/.exec(raw);
  if (!m || m[2] === void 0 && m[3] === void 0)
    return void 0;
  const sign = m[1] === "-" ? -1n : 1n;
  const int = m[2] ?? "";
  const frac = m[3] ?? "";
  const digits = int + frac;
  const n = sign * BigInt(digits === "" ? "0" : digits);
  const d = 10n ** BigInt(frac.length);
  return rat(n, d);
}
function parseOdfValue(raw) {
  const trimmed = raw.trim();
  if (trimmed.length > MAX_NUMERIC_LEXICAL)
    return void 0;
  let m = UNIT_RE.exec(trimmed);
  if (m) {
    const value = parseDecimal(m[1]);
    if (!value)
      return void 0;
    const unit = m[2];
    return { kind: "length", mm: mul(value, FACTOR_MM[unit]), unit, lexical: trimmed };
  }
  m = PERCENT_RE.exec(trimmed);
  if (m) {
    const value = parseDecimal(m[1]);
    if (!value)
      return void 0;
    return { kind: "percent", value, lexical: trimmed };
  }
  if (KEYWORD_RE.test(trimmed))
    return { kind: "keyword", value: trimmed };
  return void 0;
}
function placeDecimal(m, k) {
  const neg = m < 0n;
  let s = (neg ? -m : m).toString();
  const kk = Number(k);
  if (kk > 0) {
    while (s.length <= kk)
      s = "0" + s;
    s = s.slice(0, s.length - kk) + "." + s.slice(s.length - kk);
    let end = s.length;
    while (end > 0 && s[end - 1] === "0")
      end -= 1;
    if (end > 0 && s[end - 1] === ".")
      end -= 1;
    s = s.slice(0, end);
    if (s === "" || s === "-")
      s = "0";
  }
  return (neg ? "-" : "") + s;
}
function compareLengths(a, b) {
  const va = typeof a === "string" ? parseOdfValue(a) : a;
  const vb = typeof b === "string" ? parseOdfValue(b) : b;
  if (!va || !vb || va.kind !== "length" || vb.kind !== "length")
    return void 0;
  return cmpRational(va.mm, vb.mm);
}
function intervalFromDecimal(raw, source) {
  const t = parseDecimalOrThrow(raw.trim());
  const fracLen = raw.includes(".") ? raw.trim().split(".")[1].length : 0;
  const q = rat(1n, 10n ** BigInt(fracLen));
  const halfQ = rat(q.n, q.d * 2n);
  const f = FACTOR_MM[source];
  return {
    lo: mul(sub(t, halfQ), f),
    hi: mul(rat(t.n * (q.d * 2n) + q.n * t.d, t.d * (q.d * 2n)), f),
    // t + q/2
    nominal: mul(t, f)
  };
}
function parseDecimalOrThrow(s) {
  const r = parseDecimal(s);
  if (!r)
    throw new Error(`length core: not a decimal value or exceeds ${MAX_NUMERIC_LEXICAL} chars: "${excerpt(s)}"`);
  return r;
}
function shortestInUnit(interval, unit) {
  const f = FACTOR_MM[unit];
  const lo = div(interval.lo, f);
  const hi = div(interval.hi, f);
  const nom = div(interval.nominal, f);
  for (let k = 0n; k <= MAX_EMISSION_SEARCH_K_BIG; k += 1n) {
    const s = 10n ** k;
    const mMin = ceilDiv(lo.n * s, lo.d);
    const hiScaledNum = hi.n * s;
    const mMax = hiScaledNum % hi.d === 0n ? hiScaledNum / hi.d - 1n : floorDiv(hiScaledNum, hi.d);
    if (mMin > mMax)
      continue;
    const nomFloor = floorDiv(nom.n * s, nom.d);
    const clamp = (m2) => m2 < mMin ? mMin : m2 > mMax ? mMax : m2;
    const c1 = clamp(nomFloor);
    const c2 = clamp(nomFloor + 1n);
    const dist = (m2) => {
      const diff = m2 * nom.d - nom.n * s;
      return diff < 0n ? -diff : diff;
    };
    const m = dist(c1) <= dist(c2) ? c1 : c2;
    return `${placeDecimal(m, k)}${unit}`;
  }
  throw new Error("length core: no decimal found in interval (degenerate interval?)");
}
function convertDecimal(raw, source, target) {
  return shortestInUnit(intervalFromDecimal(raw, source), target);
}
var MAX_EMISSION_SEARCH_K, MAX_EMISSION_SEARCH_K_BIG, MAX_NUMERIC_LEXICAL, FACTOR_MM, UNIT_RE, PERCENT_RE, KEYWORD_RE;
var init_length = __esm({
  "node_modules/odf-kit/dist/core/length.js"() {
    MAX_EMISSION_SEARCH_K = 25;
    MAX_EMISSION_SEARCH_K_BIG = BigInt(MAX_EMISSION_SEARCH_K);
    MAX_NUMERIC_LEXICAL = 64;
    FACTOR_MM = {
      mm: { n: 1n, d: 1n },
      cm: { n: 10n, d: 1n },
      in: { n: 127n, d: 5n },
      pt: { n: 127n, d: 360n },
      pc: { n: 127n, d: 30n },
      px: { n: 127n, d: 480n },
      twip: { n: 127n, d: 7200n },
      emu: { n: 127n, d: 4572000n }
    };
    UNIT_RE = /^([-+]?(?:\d+(?:\.\d*)?|\.\d+))(cm|mm|in|pt|pc|px)$/;
    PERCENT_RE = /^([-+]?(?:\d+(?:\.\d*)?|\.\d+))%$/;
    KEYWORD_RE = /^[A-Za-z][A-Za-z-]*$/;
  }
});

// node_modules/odf-kit/dist/build-or-fill/build-odt/table-builder.js
function hasTextFormatting(opts) {
  return opts.bold !== void 0 || opts.italic !== void 0 || opts.fontWeight !== void 0 || opts.fontStyle !== void 0 || opts.fontSize !== void 0 || opts.fontFamily !== void 0 || opts.color !== void 0;
}
function extractTextFormatting(opts) {
  const fmt = {};
  if (opts.bold !== void 0)
    fmt.bold = opts.bold;
  if (opts.italic !== void 0)
    fmt.italic = opts.italic;
  if (opts.fontWeight !== void 0)
    fmt.fontWeight = opts.fontWeight;
  if (opts.fontStyle !== void 0)
    fmt.fontStyle = opts.fontStyle;
  if (opts.fontSize !== void 0)
    fmt.fontSize = opts.fontSize;
  if (opts.fontFamily !== void 0)
    fmt.fontFamily = opts.fontFamily;
  if (opts.color !== void 0)
    fmt.color = opts.color;
  return fmt;
}
var CellBuilder, RowBuilder, TableBuilder;
var init_table_builder = __esm({
  "node_modules/odf-kit/dist/build-or-fill/build-odt/table-builder.js"() {
    CellBuilder = class {
      /** @internal */
      runs = [];
      /**
       * Add a run of text with optional formatting.
       *
       * @param text - The text content.
       * @param formatting - Optional formatting for this run.
       * @returns This builder, for chaining.
       */
      addText(text, formatting) {
        this.runs.push({ text, formatting });
        return this;
      }
      /**
       * Add a hyperlink run to this cell.
       *
       * @param text - The visible link text.
       * @param url - The URL. Use `"#bookmarkName"` for internal links.
       * @param formatting - Optional text formatting for the link.
       * @returns This builder, for chaining.
       */
      addLink(text, url, formatting) {
        this.runs.push({ text, formatting, link: url });
        return this;
      }
      /**
       * Insert a line break at the current position in the cell.
       *
       * @returns This builder, for chaining.
       */
      addLineBreak() {
        this.runs.push({ text: "", lineBreak: true });
        return this;
      }
      /**
       * Insert an inline image at the current position in the cell.
       *
       * @param data - The raw image bytes as a Uint8Array.
       * @param options - Image options (mimeType required; width and height optional).
       * @returns This builder, for chaining.
       */
      addImage(data, options) {
        const imageData = {
          data,
          width: options.width,
          height: options.height,
          mimeType: options.mimeType,
          anchor: options.anchor ?? "as-character",
          alt: options.alt,
          description: options.description,
          name: options.name,
          wrapMode: options.wrapMode,
          margin: options.margin,
          marginTop: options.marginTop,
          marginBottom: options.marginBottom,
          marginLeft: options.marginLeft,
          marginRight: options.marginRight,
          border: options.border,
          opacity: options.opacity
        };
        this.runs.push({ text: "", image: imageData });
        return this;
      }
    };
    RowBuilder = class {
      /** @internal */
      cells = [];
      /**
       * Add a cell to this row.
       *
       * Accepts a string for plain text, a string with options for formatted text,
       * or a callback for rich text (multiple runs with different formatting).
       *
       * @param content - Cell content: string, or callback for rich text.
       * @param options - Cell options (formatting, borders, merging).
       * @returns This builder, for chaining.
       *
       * @example
       * // Plain text
       * r.addCell("Hello");
       *
       * @example
       * // Text with formatting and cell options
       * r.addCell("Header", { bold: true, backgroundColor: "#DDDDDD" });
       *
       * @example
       * // Rich text via callback
       * r.addCell((c) => {
       *   c.addText("Bold ", { bold: true });
       *   c.addText("and normal.");
       * });
       *
       * @example
       * // Rich text via callback with cell options
       * r.addCell((c) => {
       *   c.addText("Merged cell", { bold: true });
       * }, { colSpan: 2, backgroundColor: "#EEEEEE" });
       */
      addCell(content, options) {
        let runs;
        if (typeof content === "string") {
          if (options && hasTextFormatting(options)) {
            runs = [{ text: content, formatting: extractTextFormatting(options) }];
          } else {
            runs = [{ text: content }];
          }
        } else {
          const builder = new CellBuilder();
          content(builder);
          runs = builder.runs;
        }
        this.cells.push({ runs, options });
        return this;
      }
    };
    TableBuilder = class {
      /** @internal */
      rows = [];
      /**
       * Add a row to this table.
       *
       * @param buildRow - Callback receiving a {@link RowBuilder}.
       * @param options - Optional row-level options (e.g. background color).
       * @returns This builder, for chaining.
       *
       * @example
       * // Plain row
       * t.addRow((r) => { r.addCell("Alice"); r.addCell("30"); });
       *
       * @example
       * // Header row with background color
       * t.addRow((r) => {
       *   r.addCell("Name"); r.addCell("Age");
       * }, { backgroundColor: "#DDDDDD" });
       */
      addRow(buildRow, options) {
        const builder = new RowBuilder();
        buildRow(builder);
        this.rows.push({ cells: builder.cells, options });
        return this;
      }
    };
  }
});

// node_modules/odf-kit/dist/build-or-fill/build-odt/list-builder.js
function buildItemRuns(content) {
  if (typeof content === "string") {
    return [{ text: content }];
  }
  const builder = new ParagraphBuilder();
  content(builder);
  return builder.runs;
}
var ListBuilder;
var init_list_builder = __esm({
  "node_modules/odf-kit/dist/build-or-fill/build-odt/list-builder.js"() {
    init_paragraph_builder();
    ListBuilder = class _ListBuilder {
      /** @internal */
      items = [];
      /**
       * Add an item to the list.
       *
       * Pass a string for plain text, or a callback to build formatted content.
       *
       * @param content - A string or a callback receiving a {@link ParagraphBuilder}.
       * @returns This builder, for chaining.
       */
      addItem(content) {
        const runs = buildItemRuns(content);
        this.items.push({ runs });
        return this;
      }
      /**
       * Attach a nested sub-list to the most recently added item.
       *
       * @param callback - A callback receiving a new {@link ListBuilder} for the sub-list.
       * @returns This builder, for chaining.
       *
       * @example
       * l.addItem("Parent item");
       * l.addNested((sub) => {
       *   sub.addItem("Child 1");
       *   sub.addItem("Child 2");
       * });
       */
      addNested(callback) {
        if (this.items.length === 0) {
          throw new Error("addNested() requires at least one item added first");
        }
        const subBuilder = new _ListBuilder();
        callback(subBuilder);
        const lastItem = this.items[this.items.length - 1];
        lastItem.nested = { items: subBuilder.items };
        return this;
      }
    };
  }
});

// node_modules/odf-kit/dist/build-or-fill/build-odt/settings.js
function generateOdtSettings() {
  const root = el("office:document-settings").attr("xmlns:office", ODF_NS.office).attr("xmlns:config", "urn:oasis:names:tc:opendocument:xmlns:config:1.0").attr("xmlns:ooo", "http://openoffice.org/2004/office").attr("office:version", ODF_VERSION);
  const settings = el("office:settings");
  const viewSettingsSet = el("config:config-item-set").attr("config:name", "ooo:view-settings");
  viewSettingsSet.appendChild(el("config:config-item").attr("config:name", "ViewAreaTop").attr("config:type", "long").text("0"));
  viewSettingsSet.appendChild(el("config:config-item").attr("config:name", "ViewAreaLeft").attr("config:type", "long").text("0"));
  viewSettingsSet.appendChild(el("config:config-item").attr("config:name", "ViewAreaWidth").attr("config:type", "long").text("32000"));
  viewSettingsSet.appendChild(el("config:config-item").attr("config:name", "ViewAreaHeight").attr("config:type", "long").text("18000"));
  viewSettingsSet.appendChild(el("config:config-item").attr("config:name", "ShowRedlineChanges").attr("config:type", "boolean").text("true"));
  viewSettingsSet.appendChild(el("config:config-item").attr("config:name", "InBrowseMode").attr("config:type", "boolean").text("false"));
  const viewsIndexed = el("config:config-item-map-indexed").attr("config:name", "Views");
  const viewEntry = el("config:config-item-map-entry");
  viewEntry.appendChild(el("config:config-item").attr("config:name", "ViewId").attr("config:type", "string").text("view2"));
  viewEntry.appendChild(el("config:config-item").attr("config:name", "ZoomType").attr("config:type", "short").text("0"));
  viewEntry.appendChild(el("config:config-item").attr("config:name", "ZoomFactor").attr("config:type", "short").text("100"));
  viewEntry.appendChild(el("config:config-item").attr("config:name", "ViewLayoutColumns").attr("config:type", "short").text("1"));
  viewEntry.appendChild(el("config:config-item").attr("config:name", "ViewLayoutBookMode").attr("config:type", "boolean").text("false"));
  viewEntry.appendChild(el("config:config-item").attr("config:name", "IsSelectedFrame").attr("config:type", "boolean").text("false"));
  viewsIndexed.appendChild(viewEntry);
  viewSettingsSet.appendChild(viewsIndexed);
  settings.appendChild(viewSettingsSet);
  root.appendChild(settings);
  return xmlDocumentCompact(root);
}
var init_settings = __esm({
  "node_modules/odf-kit/dist/build-or-fill/build-odt/settings.js"() {
    init_namespaces();
    init_xml();
  }
});

// node_modules/odf-kit/dist/build-or-fill/build-odt/document.js
function buildRuns(content) {
  if (typeof content === "string") {
    return [{ text: content }];
  }
  const builder = new ParagraphBuilder();
  content(builder);
  return builder.runs;
}
function buildHeaderFooterRuns(content) {
  if (typeof content === "function") {
    const builder = new HeaderFooterBuilder();
    content(builder);
    return builder.runs;
  }
  const runs = [];
  const parts = content.split("###");
  for (let i2 = 0; i2 < parts.length; i2++) {
    if (parts[i2] !== "") {
      runs.push({ text: parts[i2] });
    }
    if (i2 < parts.length - 1) {
      runs.push({ text: "#", field: "page-number" });
    }
  }
  if (runs.length === 0) {
    runs.push({ text: content });
  }
  return runs;
}
function buildTableData(content, options) {
  if (typeof content === "function") {
    const builder = new TableBuilder();
    content(builder);
    return { rows: builder.rows, options };
  }
  return {
    rows: content.map((row) => ({
      cells: row.map((text) => ({
        runs: [{ text }]
      }))
    })),
    options
  };
}
function buildListData(content, options) {
  if (typeof content === "function") {
    const builder = new ListBuilder();
    content(builder);
    return { items: builder.items, options };
  }
  return {
    items: content.map((text) => ({
      runs: [{ text }]
    })),
    options
  };
}
function mimeToExtension(mimeType) {
  switch (mimeType) {
    case "image/png":
      return ".png";
    case "image/jpeg":
      return ".jpeg";
    case "image/gif":
      return ".gif";
    case "image/svg+xml":
      return ".svg";
    case "image/webp":
      return ".webp";
    case "image/bmp":
      return ".bmp";
    case "image/tiff":
      return ".tiff";
    default:
      return ".bin";
  }
}
var ODT_MIME_TYPE, OdtDocument;
var init_document = __esm({
  "node_modules/odf-kit/dist/build-or-fill/build-odt/document.js"() {
    init_packaging();
    init_metadata();
    init_styles();
    init_content();
    init_paragraph_builder();
    init_header_footer_builder();
    init_length();
    init_table_builder();
    init_list_builder();
    init_settings();
    ODT_MIME_TYPE = "application/vnd.oasis.opendocument.text";
    OdtDocument = class {
      elements = [];
      metadata = {};
      pageLayout;
      headerRuns = null;
      footerRuns = null;
      /** Set document metadata (title, creator, etc.). */
      setMetadata(options) {
        this.metadata = { ...this.metadata, ...options };
        return this;
      }
      /**
       * Set the page layout (size, margins, orientation).
       *
       * Defaults to A4 portrait with 2cm margins if not called.
       *
       * When `orientation` is `"landscape"`, the emitted page dimensions are
       * always in landscape order. If `width`/`height` are omitted, A4
       * landscape (29.7 × 21 cm) is used. If portrait-shaped dimensions are
       * supplied (width < height) alongside `orientation: "landscape"`, they
       * are swapped to match the requested orientation. This is the bug fix
       * for v0.13.5 — previously, supplying portrait dimensions with
       * `orientation: "landscape"` would emit `style:print-orientation="landscape"`
       * while leaving `fo:page-width`/`fo:page-height` in portrait order,
       * causing LibreOffice and Word to open the document in portrait.
       *
       * @param layout - Page layout options.
       * @returns This document, for chaining.
       *
       * @example
       * doc.setPageLayout({ orientation: "landscape" });
       *
       * @example
       * doc.setPageLayout({
       *   width: "8.5in",
       *   height: "11in",
       *   marginTop: "1in",
       *   marginBottom: "1in",
       * });
       */
      setPageLayout(layout) {
        this.pageLayout = { ...this.pageLayout, ...layout };
        return this;
      }
      /**
       * Set the document header (appears at the top of every page).
       *
       * Pass a string for plain text, or a callback to build formatted content.
       * Use `###` in a string to insert the current page number.
       *
       * @param content - A string, or a callback receiving a
       *   {@link HeaderFooterBuilder}.
       * @returns This document, for chaining.
       *
       * @example
       * doc.setHeader("Company Report — Confidential");
       *
       * @example
       * doc.setHeader("Page ###");
       *
       * @example
       * doc.setHeader((h) => {
       *   h.addText("Report", { bold: true });
       *   h.addText(" — Page ");
       *   h.addPageNumber();
       * });
       */
      setHeader(content) {
        this.headerRuns = buildHeaderFooterRuns(content);
        return this;
      }
      /**
       * Set the document footer (appears at the bottom of every page).
       *
       * Pass a string for plain text, or a callback to build formatted content.
       * Use `###` in a string to insert the current page number.
       *
       * @param content - A string, or a callback receiving a
       *   {@link HeaderFooterBuilder}.
       * @returns This document, for chaining.
       *
       * @example
       * doc.setFooter("Page ###");
       *
       * @example
       * doc.setFooter((f) => {
       *   f.addText("Page ");
       *   f.addPageNumber({ bold: true });
       *   f.addText(" — Confidential", { italic: true, color: "gray" });
       * });
       */
      setFooter(content) {
        this.footerRuns = buildHeaderFooterRuns(content);
        return this;
      }
      /**
       * Add a paragraph to the document.
       *
       * Pass a string for plain text, or a callback to build formatted content.
       * Optional second parameter for paragraph-level options like tab stops.
       *
       * @param content - A string for plain text, or a callback receiving a
       *   {@link ParagraphBuilder} for formatted text with multiple runs.
       * @param options - Optional paragraph options (tab stops).
       * @returns This document, for chaining.
       *
       * @example
       * doc.addParagraph("Hello, World!");
       *
       * @example
       * doc.addParagraph((p) => {
       *   p.addText("This is ");
       *   p.addText("bold", { bold: true });
       *   p.addText(" text.");
       * });
       *
       * @example
       * // With tab stops
       * doc.addParagraph((p) => {
       *   p.addText("Label");
       *   p.addTab();
       *   p.addText("Value");
       * }, { tabStops: [{ position: "8cm" }] });
       *
       * @example
       * // With links
       * doc.addParagraph((p) => {
       *   p.addText("Visit ");
       *   p.addLink("our site", "https://example.com");
       * });
       */
      addParagraph(content, options) {
        this.elements.push({
          type: "paragraph",
          runs: buildRuns(content),
          paragraphOptions: options
        });
        return this;
      }
      /**
       * Add a heading to the document.
       *
       * Pass a string for plain text, or a callback to build formatted content.
       * Level defaults to 1 if not specified.
       *
       * @param content - A string for plain text, or a callback receiving a
       *   {@link ParagraphBuilder} for formatted text with multiple runs.
       * @param level - Heading level, 1–6. Defaults to 1.
       * @param options - Optional paragraph options (alignment, spacing, indentation).
       * @returns This document, for chaining.
       *
       * @example
       * doc.addHeading("Chapter One", 1);
       *
       * @example
       * doc.addHeading((h) => {
       *   h.addText("Chapter ");
       *   h.addText("One", { italic: true });
       * }, 1);
       *
       * @example
       * // Centered heading with spacing
       * doc.addHeading("Introduction", 2, { align: "center", spaceBefore: "0.5cm" });
       */
      addHeading(content, level = 1, options) {
        this.elements.push({
          type: "heading",
          level,
          runs: buildRuns(content),
          paragraphOptions: options
        });
        return this;
      }
      /**
       * Add a table to the document.
       *
       * Pass an array of arrays for a simple table, or a callback to build
       * a table with formatting, borders, backgrounds, and cell merging.
       *
       * @param content - An array of string arrays (rows of cells), or a
       *   callback receiving a {@link TableBuilder}.
       * @param options - Optional table-level settings (column widths, default border).
       * @returns This document, for chaining.
       *
       * @example
       * doc.addTable([
       *   ["Name", "Age"],
       *   ["Alice", "30"],
       * ]);
       *
       * @example
       * doc.addTable((t) => {
       *   t.addRow((r) => {
       *     r.addCell("Name", { bold: true, backgroundColor: "#DDDDDD" });
       *     r.addCell("Age", { bold: true, backgroundColor: "#DDDDDD" });
       *   });
       *   t.addRow((r) => { r.addCell("Alice"); r.addCell("30"); });
       * }, { columnWidths: ["5cm", "3cm"] });
       */
      addTable(content, options) {
        this.elements.push({
          type: "table",
          table: buildTableData(content, options)
        });
        return this;
      }
      /**
       * Add a list to the document.
       *
       * Pass an array of strings for a simple list, or a callback to build
       * a list with formatting and nesting.
       *
       * @param content - An array of strings (simple items), or a
       *   callback receiving a {@link ListBuilder}.
       * @param options - Optional list-level settings (type: bullet or numbered).
       * @returns This document, for chaining.
       *
       * @example
       * // Simple bullet list
       * doc.addList(["Item 1", "Item 2", "Item 3"]);
       *
       * @example
       * // Numbered list
       * doc.addList(["First", "Second", "Third"], { type: "numbered" });
       *
       * @example
       * // Builder for formatting and nesting
       * doc.addList((l) => {
       *   l.addItem("Plain text item");
       *   l.addItem((p) => {
       *     p.addText("Formatted ", { bold: true });
       *     p.addText("item");
       *   });
       *   l.addItem("Parent");
       *   l.addNested((sub) => {
       *     sub.addItem("Child 1");
       *     sub.addItem("Child 2");
       *   });
       * });
       */
      addList(content, options) {
        this.elements.push({
          type: "list",
          list: buildListData(content, options)
        });
        return this;
      }
      /**
       * Add a standalone image to the document.
       *
       * The image is placed in its own paragraph, anchored to the paragraph
       * by default. For inline images within text, use `p.addImage()` inside
       * an `addParagraph()` callback.
       *
       * @param data - The raw image bytes as a Uint8Array.
       * @param options - Image options (width, height, mimeType are required).
       * @returns This document, for chaining.
       *
       * @example
       * doc.addImage(pngBytes, {
       *   width: "10cm",
       *   height: "6cm",
       *   mimeType: "image/png",
       * });
       *
       * @example
       * // Explicit anchor type
       * doc.addImage(jpegBytes, {
       *   width: "15cm",
       *   height: "10cm",
       *   mimeType: "image/jpeg",
       *   anchor: "paragraph",
       * });
       */
      addImage(data, options) {
        const imageData = {
          data,
          width: options.width,
          height: options.height,
          mimeType: options.mimeType,
          anchor: options.anchor ?? "paragraph",
          alt: options.alt,
          description: options.description,
          name: options.name,
          wrapMode: options.wrapMode,
          margin: options.margin,
          marginTop: options.marginTop,
          marginBottom: options.marginBottom,
          marginLeft: options.marginLeft,
          marginRight: options.marginRight,
          border: options.border,
          opacity: options.opacity
        };
        this.elements.push({
          type: "image",
          image: imageData
        });
        return this;
      }
      /**
       * Insert a page break. Content after this will start on a new page.
       *
       * @returns This document, for chaining.
       *
       * @example
       * doc.addHeading("Chapter 1", 1);
       * doc.addParagraph("Chapter 1 content.");
       * doc.addPageBreak();
       * doc.addHeading("Chapter 2", 1);
       * doc.addParagraph("Chapter 2 content.");
       */
      addPageBreak() {
        this.elements.push({ type: "page-break" });
        return this;
      }
      /**
       * Generate the ODT file as a Uint8Array.
       *
       * The returned bytes are a valid ZIP/ODF package that can be written
       * to disk or sent over the network.
       */
      async save() {
        const { imageMap, imageFiles } = this.collectImages();
        const contentXml = generateContent(this.elements, imageMap);
        const stylesConfig = this.buildStylesConfig();
        const stylesXml = generateStyles(stylesConfig);
        const metaXml = generateMeta(this.metadata);
        const files = [
          { path: "content.xml", content: contentXml },
          { path: "styles.xml", content: stylesXml },
          { path: "meta.xml", content: metaXml },
          { path: "settings.xml", content: generateOdtSettings() },
          ...imageFiles
        ];
        return assemblePackage(ODT_MIME_TYPE, files);
      }
      /**
       * Build the StylesConfig from document settings.
       */
      buildStylesConfig() {
        const config = {};
        const allStyles = [];
        if (this.pageLayout) {
          const pl = this.pageLayout;
          const isLandscape = pl.orientation === "landscape";
          const hasExplicitDimensions = pl.width !== void 0 && pl.height !== void 0;
          let resolvedWidth = pl.width ?? (isLandscape && !hasExplicitDimensions ? "29.7cm" : "21cm");
          let resolvedHeight = pl.height ?? (isLandscape && !hasExplicitDimensions ? "21cm" : "29.7cm");
          if (isLandscape) {
            const cmp = compareLengths(resolvedWidth, resolvedHeight);
            if (cmp !== void 0 && cmp < 0) {
              [resolvedWidth, resolvedHeight] = [resolvedHeight, resolvedWidth];
            }
          }
          config.pageLayout = {
            width: resolvedWidth,
            height: resolvedHeight,
            orientation: pl.orientation ?? "portrait",
            marginTop: pl.marginTop ?? "2cm",
            marginBottom: pl.marginBottom ?? "2cm",
            marginLeft: pl.marginLeft ?? "2cm",
            marginRight: pl.marginRight ?? "2cm"
          };
        }
        if (this.headerRuns) {
          const result = buildHeaderFooterContent(this.headerRuns, "Header", "HF");
          config.headerParagraph = result.paragraph;
          allStyles.push(...result.styles);
        }
        if (this.footerRuns) {
          const prefix = allStyles.length > 0 ? "FF" : "HF";
          const result = buildHeaderFooterContent(this.footerRuns, "Footer", prefix);
          config.footerParagraph = result.paragraph;
          allStyles.push(...result.styles);
        }
        if (allStyles.length > 0) {
          config.headerFooterStyles = allStyles;
        }
        return config;
      }
      /**
       * Scan all content elements for embedded images.
       * Returns a mapping from ImageData objects to ZIP paths, plus PackageFile entries.
       */
      collectImages() {
        const imageMap = /* @__PURE__ */ new Map();
        const imageFiles = [];
        let counter = 1;
        const register = (img) => {
          if (imageMap.has(img))
            return;
          const ext = mimeToExtension(img.mimeType);
          const path = `Pictures/image${counter}${ext}`;
          imageMap.set(img, path);
          imageFiles.push({ path, content: img.data, mediaType: img.mimeType });
          counter++;
        };
        const scanRuns = (runs) => {
          for (const run of runs) {
            if (run.image)
              register(run.image);
          }
        };
        const scanListItems = (items) => {
          for (const item of items) {
            scanRuns(item.runs);
            if (item.nested)
              scanListItems(item.nested.items);
          }
        };
        for (const element of this.elements) {
          if (element.image)
            register(element.image);
          if (element.runs)
            scanRuns(element.runs);
          if (element.type === "table" && element.table) {
            for (const row of element.table.rows) {
              for (const cell of row.cells) {
                scanRuns(cell.runs);
              }
            }
          }
          if (element.type === "list" && element.list) {
            scanListItems(element.list.items);
          }
        }
        return { imageMap, imageFiles };
      }
    };
  }
});

// node_modules/odf-kit/dist/html/to-odt/html-to-odt.js
init_document();

// node_modules/odf-kit/dist/odt/read/xml-parser.js
function decodeEntities(raw) {
  return raw.replace(/&(?:amp|lt|gt|quot|apos);|&#x([0-9a-fA-F]+);|&#([0-9]+);/g, (entity, hex, dec) => {
    if (hex !== void 0)
      return String.fromCodePoint(parseInt(hex, 16));
    if (dec !== void 0)
      return String.fromCodePoint(parseInt(dec, 10));
    switch (entity) {
      case "&amp;":
        return "&";
      case "&lt;":
        return "<";
      case "&gt;":
        return ">";
      case "&quot;":
        return '"';
      case "&apos;":
        return "'";
      default:
        return entity;
    }
  });
}
function validateAttributeValueEntities(value, attrName, parentTag) {
  const validEntity = /&(?:amp|lt|gt|quot|apos|#[0-9]+|#x[0-9a-fA-F]+);/y;
  let i2 = 0;
  while ((i2 = value.indexOf("&", i2)) !== -1) {
    validEntity.lastIndex = i2;
    if (!validEntity.test(value)) {
      throw new Error(`parseXml: unescaped '&' in attribute value of <${parentTag} ${attrName}="${value}">`);
    }
    i2 = validEntity.lastIndex;
  }
}
function parseAttributes(raw, parentTag) {
  const attrs = {};
  const re = /([a-zA-Z_:][a-zA-Z0-9_:.-]*)=(?:"([^"]*)"|'([^']*)')/y;
  let i2 = 0;
  while (i2 < raw.length) {
    while (i2 < raw.length && /\s/.test(raw[i2]))
      i2++;
    if (i2 >= raw.length)
      break;
    re.lastIndex = i2;
    const m = re.exec(raw);
    if (m === null || m.index !== i2) {
      const offending = raw.slice(i2).trimEnd();
      throw new Error(`parseXml: malformed attribute syntax in <${parentTag}>: '${offending}'`);
    }
    const attrName = m[1];
    const attrValue = m[2] ?? m[3];
    validateAttributeValueEntities(attrValue, attrName, parentTag);
    attrs[attrName] = decodeEntities(attrValue);
    i2 += m[0].length;
  }
  return attrs;
}
function parseXml(xml) {
  const src = xml.startsWith("\uFEFF") ? xml.slice(1) : xml;
  const stack = [];
  let root;
  let i2 = 0;
  while (i2 < src.length) {
    if (src[i2] !== "<") {
      const end = src.indexOf("<", i2);
      const raw = end === -1 ? src.slice(i2) : src.slice(i2, end);
      i2 = end === -1 ? src.length : end;
      if (raw.includes("]]>")) {
        throw new Error("parseXml: ']]>' outside CDATA section");
      }
      if (raw.length > 0 && stack.length > 0) {
        stack[stack.length - 1].children.push({
          type: "text",
          text: decodeEntities(raw)
        });
      }
      continue;
    }
    if (src.startsWith("<!--", i2)) {
      const end = src.indexOf("-->", i2);
      i2 = end === -1 ? src.length : end + 3;
      continue;
    }
    if (src.startsWith("<![CDATA[", i2)) {
      const end = src.indexOf("]]>", i2);
      if (end !== -1) {
        const text = src.slice(i2 + 9, end);
        if (text.length > 0 && stack.length > 0) {
          stack[stack.length - 1].children.push({ type: "text", text });
        }
        i2 = end + 3;
      } else {
        i2 = src.length;
      }
      continue;
    }
    let j = i2 + 1;
    while (j < src.length && src[j] !== ">") {
      if (src[j] === '"' || src[j] === "'") {
        const quote = src[j++];
        while (j < src.length && src[j] !== quote)
          j++;
        if (j < src.length)
          j++;
      } else {
        j++;
      }
    }
    if (j >= src.length)
      break;
    const inner = src.slice(i2 + 1, j);
    i2 = j + 1;
    if (inner.startsWith("?"))
      continue;
    if (inner.startsWith("!"))
      continue;
    if (inner.startsWith("/")) {
      const closeTag = inner.slice(1).trim();
      if (stack.length === 0) {
        throw new Error(`parseXml: closing tag </${closeTag}> with no matching open tag`);
      }
      const top = stack[stack.length - 1];
      if (top.tag !== closeTag) {
        throw new Error(`parseXml: mismatched closing tag </${closeTag}>; expected </${top.tag}>`);
      }
      stack.pop();
      continue;
    }
    if (inner.endsWith("/")) {
      const body = inner.slice(0, -1).trimEnd();
      const space2 = body.search(/\s/);
      const tag2 = space2 === -1 ? body : body.slice(0, space2);
      const attrs2 = space2 === -1 ? {} : parseAttributes(body.slice(space2 + 1), tag2);
      const node2 = { type: "element", tag: tag2, attrs: attrs2, children: [] };
      if (stack.length > 0) {
        stack[stack.length - 1].children.push(node2);
      } else if (!root) {
        root = node2;
      }
      continue;
    }
    const space = inner.search(/\s/);
    const tag = space === -1 ? inner : inner.slice(0, space);
    const attrs = space === -1 ? {} : parseAttributes(inner.slice(space + 1), tag);
    const node = { type: "element", tag, attrs, children: [] };
    if (stack.length > 0) {
      stack[stack.length - 1].children.push(node);
    }
    stack.push(node);
    if (!root)
      root = node;
  }
  if (!root)
    throw new Error("parseXml: no root element found");
  if (stack.length > 0) {
    const tags = stack.map((n) => `<${n.tag}>`).join(", ");
    throw new Error(`parseXml: unclosed elements: ${tags}`);
  }
  return root;
}
var odfKitParser = (xml) => parseXml(xml);

// node_modules/odf-kit/dist/html/normalize/rules/void-elements.js
var VOID_ELEMENT_PATTERN = /<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)(?=[\s/>])([^>]*)>/g;
function selfCloseVoidElements(html) {
  return html.replace(VOID_ELEMENT_PATTERN, (match, tag, body) => {
    const trimmed = body.replace(/\s+$/, "");
    if (trimmed.endsWith("/")) {
      return match;
    }
    return body.length > 0 ? `<${tag}${trimmed} />` : `<${tag} />`;
  });
}

// node_modules/odf-kit/dist/html/normalize/data/entities-table.js
var ENTITIES = Object.freeze({
  AElig: "\xC6",
  AMP: "&",
  Aacute: "\xC1",
  Abreve: "\u0102",
  Acirc: "\xC2",
  Acy: "\u0410",
  Afr: "\u{1D504}",
  Agrave: "\xC0",
  Alpha: "\u0391",
  Amacr: "\u0100",
  And: "\u2A53",
  Aogon: "\u0104",
  Aopf: "\u{1D538}",
  ApplyFunction: "\u2061",
  Aring: "\xC5",
  Ascr: "\u{1D49C}",
  Assign: "\u2254",
  Atilde: "\xC3",
  Auml: "\xC4",
  Backslash: "\u2216",
  Barv: "\u2AE7",
  Barwed: "\u2306",
  Bcy: "\u0411",
  Because: "\u2235",
  Bernoullis: "\u212C",
  Beta: "\u0392",
  Bfr: "\u{1D505}",
  Bopf: "\u{1D539}",
  Breve: "\u02D8",
  Bscr: "\u212C",
  Bumpeq: "\u224E",
  CHcy: "\u0427",
  COPY: "\xA9",
  Cacute: "\u0106",
  Cap: "\u22D2",
  CapitalDifferentialD: "\u2145",
  Cayleys: "\u212D",
  Ccaron: "\u010C",
  Ccedil: "\xC7",
  Ccirc: "\u0108",
  Cconint: "\u2230",
  Cdot: "\u010A",
  Cedilla: "\xB8",
  CenterDot: "\xB7",
  Cfr: "\u212D",
  Chi: "\u03A7",
  CircleDot: "\u2299",
  CircleMinus: "\u2296",
  CirclePlus: "\u2295",
  CircleTimes: "\u2297",
  ClockwiseContourIntegral: "\u2232",
  CloseCurlyDoubleQuote: "\u201D",
  CloseCurlyQuote: "\u2019",
  Colon: "\u2237",
  Colone: "\u2A74",
  Congruent: "\u2261",
  Conint: "\u222F",
  ContourIntegral: "\u222E",
  Copf: "\u2102",
  Coproduct: "\u2210",
  CounterClockwiseContourIntegral: "\u2233",
  Cross: "\u2A2F",
  Cscr: "\u{1D49E}",
  Cup: "\u22D3",
  CupCap: "\u224D",
  DD: "\u2145",
  DDotrahd: "\u2911",
  DJcy: "\u0402",
  DScy: "\u0405",
  DZcy: "\u040F",
  Dagger: "\u2021",
  Darr: "\u21A1",
  Dashv: "\u2AE4",
  Dcaron: "\u010E",
  Dcy: "\u0414",
  Del: "\u2207",
  Delta: "\u0394",
  Dfr: "\u{1D507}",
  DiacriticalAcute: "\xB4",
  DiacriticalDot: "\u02D9",
  DiacriticalDoubleAcute: "\u02DD",
  DiacriticalGrave: "`",
  DiacriticalTilde: "\u02DC",
  Diamond: "\u22C4",
  DifferentialD: "\u2146",
  Dopf: "\u{1D53B}",
  Dot: "\xA8",
  DotDot: "\u20DC",
  DotEqual: "\u2250",
  DoubleContourIntegral: "\u222F",
  DoubleDot: "\xA8",
  DoubleDownArrow: "\u21D3",
  DoubleLeftArrow: "\u21D0",
  DoubleLeftRightArrow: "\u21D4",
  DoubleLeftTee: "\u2AE4",
  DoubleLongLeftArrow: "\u27F8",
  DoubleLongLeftRightArrow: "\u27FA",
  DoubleLongRightArrow: "\u27F9",
  DoubleRightArrow: "\u21D2",
  DoubleRightTee: "\u22A8",
  DoubleUpArrow: "\u21D1",
  DoubleUpDownArrow: "\u21D5",
  DoubleVerticalBar: "\u2225",
  DownArrow: "\u2193",
  DownArrowBar: "\u2913",
  DownArrowUpArrow: "\u21F5",
  DownBreve: "\u0311",
  DownLeftRightVector: "\u2950",
  DownLeftTeeVector: "\u295E",
  DownLeftVector: "\u21BD",
  DownLeftVectorBar: "\u2956",
  DownRightTeeVector: "\u295F",
  DownRightVector: "\u21C1",
  DownRightVectorBar: "\u2957",
  DownTee: "\u22A4",
  DownTeeArrow: "\u21A7",
  Downarrow: "\u21D3",
  Dscr: "\u{1D49F}",
  Dstrok: "\u0110",
  ENG: "\u014A",
  ETH: "\xD0",
  Eacute: "\xC9",
  Ecaron: "\u011A",
  Ecirc: "\xCA",
  Ecy: "\u042D",
  Edot: "\u0116",
  Efr: "\u{1D508}",
  Egrave: "\xC8",
  Element: "\u2208",
  Emacr: "\u0112",
  EmptySmallSquare: "\u25FB",
  EmptyVerySmallSquare: "\u25AB",
  Eogon: "\u0118",
  Eopf: "\u{1D53C}",
  Epsilon: "\u0395",
  Equal: "\u2A75",
  EqualTilde: "\u2242",
  Equilibrium: "\u21CC",
  Escr: "\u2130",
  Esim: "\u2A73",
  Eta: "\u0397",
  Euml: "\xCB",
  Exists: "\u2203",
  ExponentialE: "\u2147",
  Fcy: "\u0424",
  Ffr: "\u{1D509}",
  FilledSmallSquare: "\u25FC",
  FilledVerySmallSquare: "\u25AA",
  Fopf: "\u{1D53D}",
  ForAll: "\u2200",
  Fouriertrf: "\u2131",
  Fscr: "\u2131",
  GJcy: "\u0403",
  GT: ">",
  Gamma: "\u0393",
  Gammad: "\u03DC",
  Gbreve: "\u011E",
  Gcedil: "\u0122",
  Gcirc: "\u011C",
  Gcy: "\u0413",
  Gdot: "\u0120",
  Gfr: "\u{1D50A}",
  Gg: "\u22D9",
  Gopf: "\u{1D53E}",
  GreaterEqual: "\u2265",
  GreaterEqualLess: "\u22DB",
  GreaterFullEqual: "\u2267",
  GreaterGreater: "\u2AA2",
  GreaterLess: "\u2277",
  GreaterSlantEqual: "\u2A7E",
  GreaterTilde: "\u2273",
  Gscr: "\u{1D4A2}",
  Gt: "\u226B",
  HARDcy: "\u042A",
  Hacek: "\u02C7",
  Hat: "^",
  Hcirc: "\u0124",
  Hfr: "\u210C",
  HilbertSpace: "\u210B",
  Hopf: "\u210D",
  HorizontalLine: "\u2500",
  Hscr: "\u210B",
  Hstrok: "\u0126",
  HumpDownHump: "\u224E",
  HumpEqual: "\u224F",
  IEcy: "\u0415",
  IJlig: "\u0132",
  IOcy: "\u0401",
  Iacute: "\xCD",
  Icirc: "\xCE",
  Icy: "\u0418",
  Idot: "\u0130",
  Ifr: "\u2111",
  Igrave: "\xCC",
  Im: "\u2111",
  Imacr: "\u012A",
  ImaginaryI: "\u2148",
  Implies: "\u21D2",
  Int: "\u222C",
  Integral: "\u222B",
  Intersection: "\u22C2",
  InvisibleComma: "\u2063",
  InvisibleTimes: "\u2062",
  Iogon: "\u012E",
  Iopf: "\u{1D540}",
  Iota: "\u0399",
  Iscr: "\u2110",
  Itilde: "\u0128",
  Iukcy: "\u0406",
  Iuml: "\xCF",
  Jcirc: "\u0134",
  Jcy: "\u0419",
  Jfr: "\u{1D50D}",
  Jopf: "\u{1D541}",
  Jscr: "\u{1D4A5}",
  Jsercy: "\u0408",
  Jukcy: "\u0404",
  KHcy: "\u0425",
  KJcy: "\u040C",
  Kappa: "\u039A",
  Kcedil: "\u0136",
  Kcy: "\u041A",
  Kfr: "\u{1D50E}",
  Kopf: "\u{1D542}",
  Kscr: "\u{1D4A6}",
  LJcy: "\u0409",
  LT: "<",
  Lacute: "\u0139",
  Lambda: "\u039B",
  Lang: "\u27EA",
  Laplacetrf: "\u2112",
  Larr: "\u219E",
  Lcaron: "\u013D",
  Lcedil: "\u013B",
  Lcy: "\u041B",
  LeftAngleBracket: "\u27E8",
  LeftArrow: "\u2190",
  LeftArrowBar: "\u21E4",
  LeftArrowRightArrow: "\u21C6",
  LeftCeiling: "\u2308",
  LeftDoubleBracket: "\u27E6",
  LeftDownTeeVector: "\u2961",
  LeftDownVector: "\u21C3",
  LeftDownVectorBar: "\u2959",
  LeftFloor: "\u230A",
  LeftRightArrow: "\u2194",
  LeftRightVector: "\u294E",
  LeftTee: "\u22A3",
  LeftTeeArrow: "\u21A4",
  LeftTeeVector: "\u295A",
  LeftTriangle: "\u22B2",
  LeftTriangleBar: "\u29CF",
  LeftTriangleEqual: "\u22B4",
  LeftUpDownVector: "\u2951",
  LeftUpTeeVector: "\u2960",
  LeftUpVector: "\u21BF",
  LeftUpVectorBar: "\u2958",
  LeftVector: "\u21BC",
  LeftVectorBar: "\u2952",
  Leftarrow: "\u21D0",
  Leftrightarrow: "\u21D4",
  LessEqualGreater: "\u22DA",
  LessFullEqual: "\u2266",
  LessGreater: "\u2276",
  LessLess: "\u2AA1",
  LessSlantEqual: "\u2A7D",
  LessTilde: "\u2272",
  Lfr: "\u{1D50F}",
  Ll: "\u22D8",
  Lleftarrow: "\u21DA",
  Lmidot: "\u013F",
  LongLeftArrow: "\u27F5",
  LongLeftRightArrow: "\u27F7",
  LongRightArrow: "\u27F6",
  Longleftarrow: "\u27F8",
  Longleftrightarrow: "\u27FA",
  Longrightarrow: "\u27F9",
  Lopf: "\u{1D543}",
  LowerLeftArrow: "\u2199",
  LowerRightArrow: "\u2198",
  Lscr: "\u2112",
  Lsh: "\u21B0",
  Lstrok: "\u0141",
  Lt: "\u226A",
  Map: "\u2905",
  Mcy: "\u041C",
  MediumSpace: "\u205F",
  Mellintrf: "\u2133",
  Mfr: "\u{1D510}",
  MinusPlus: "\u2213",
  Mopf: "\u{1D544}",
  Mscr: "\u2133",
  Mu: "\u039C",
  NJcy: "\u040A",
  Nacute: "\u0143",
  Ncaron: "\u0147",
  Ncedil: "\u0145",
  Ncy: "\u041D",
  NegativeMediumSpace: "\u200B",
  NegativeThickSpace: "\u200B",
  NegativeThinSpace: "\u200B",
  NegativeVeryThinSpace: "\u200B",
  NestedGreaterGreater: "\u226B",
  NestedLessLess: "\u226A",
  NewLine: "\n",
  Nfr: "\u{1D511}",
  NoBreak: "\u2060",
  NonBreakingSpace: "\xA0",
  Nopf: "\u2115",
  Not: "\u2AEC",
  NotCongruent: "\u2262",
  NotCupCap: "\u226D",
  NotDoubleVerticalBar: "\u2226",
  NotElement: "\u2209",
  NotEqual: "\u2260",
  NotEqualTilde: "\u2242\u0338",
  NotExists: "\u2204",
  NotGreater: "\u226F",
  NotGreaterEqual: "\u2271",
  NotGreaterFullEqual: "\u2267\u0338",
  NotGreaterGreater: "\u226B\u0338",
  NotGreaterLess: "\u2279",
  NotGreaterSlantEqual: "\u2A7E\u0338",
  NotGreaterTilde: "\u2275",
  NotHumpDownHump: "\u224E\u0338",
  NotHumpEqual: "\u224F\u0338",
  NotLeftTriangle: "\u22EA",
  NotLeftTriangleBar: "\u29CF\u0338",
  NotLeftTriangleEqual: "\u22EC",
  NotLess: "\u226E",
  NotLessEqual: "\u2270",
  NotLessGreater: "\u2278",
  NotLessLess: "\u226A\u0338",
  NotLessSlantEqual: "\u2A7D\u0338",
  NotLessTilde: "\u2274",
  NotNestedGreaterGreater: "\u2AA2\u0338",
  NotNestedLessLess: "\u2AA1\u0338",
  NotPrecedes: "\u2280",
  NotPrecedesEqual: "\u2AAF\u0338",
  NotPrecedesSlantEqual: "\u22E0",
  NotReverseElement: "\u220C",
  NotRightTriangle: "\u22EB",
  NotRightTriangleBar: "\u29D0\u0338",
  NotRightTriangleEqual: "\u22ED",
  NotSquareSubset: "\u228F\u0338",
  NotSquareSubsetEqual: "\u22E2",
  NotSquareSuperset: "\u2290\u0338",
  NotSquareSupersetEqual: "\u22E3",
  NotSubset: "\u2282\u20D2",
  NotSubsetEqual: "\u2288",
  NotSucceeds: "\u2281",
  NotSucceedsEqual: "\u2AB0\u0338",
  NotSucceedsSlantEqual: "\u22E1",
  NotSucceedsTilde: "\u227F\u0338",
  NotSuperset: "\u2283\u20D2",
  NotSupersetEqual: "\u2289",
  NotTilde: "\u2241",
  NotTildeEqual: "\u2244",
  NotTildeFullEqual: "\u2247",
  NotTildeTilde: "\u2249",
  NotVerticalBar: "\u2224",
  Nscr: "\u{1D4A9}",
  Ntilde: "\xD1",
  Nu: "\u039D",
  OElig: "\u0152",
  Oacute: "\xD3",
  Ocirc: "\xD4",
  Ocy: "\u041E",
  Odblac: "\u0150",
  Ofr: "\u{1D512}",
  Ograve: "\xD2",
  Omacr: "\u014C",
  Omega: "\u03A9",
  Omicron: "\u039F",
  Oopf: "\u{1D546}",
  OpenCurlyDoubleQuote: "\u201C",
  OpenCurlyQuote: "\u2018",
  Or: "\u2A54",
  Oscr: "\u{1D4AA}",
  Oslash: "\xD8",
  Otilde: "\xD5",
  Otimes: "\u2A37",
  Ouml: "\xD6",
  OverBar: "\u203E",
  OverBrace: "\u23DE",
  OverBracket: "\u23B4",
  OverParenthesis: "\u23DC",
  PartialD: "\u2202",
  Pcy: "\u041F",
  Pfr: "\u{1D513}",
  Phi: "\u03A6",
  Pi: "\u03A0",
  PlusMinus: "\xB1",
  Poincareplane: "\u210C",
  Popf: "\u2119",
  Pr: "\u2ABB",
  Precedes: "\u227A",
  PrecedesEqual: "\u2AAF",
  PrecedesSlantEqual: "\u227C",
  PrecedesTilde: "\u227E",
  Prime: "\u2033",
  Product: "\u220F",
  Proportion: "\u2237",
  Proportional: "\u221D",
  Pscr: "\u{1D4AB}",
  Psi: "\u03A8",
  QUOT: '"',
  Qfr: "\u{1D514}",
  Qopf: "\u211A",
  Qscr: "\u{1D4AC}",
  RBarr: "\u2910",
  REG: "\xAE",
  Racute: "\u0154",
  Rang: "\u27EB",
  Rarr: "\u21A0",
  Rarrtl: "\u2916",
  Rcaron: "\u0158",
  Rcedil: "\u0156",
  Rcy: "\u0420",
  Re: "\u211C",
  ReverseElement: "\u220B",
  ReverseEquilibrium: "\u21CB",
  ReverseUpEquilibrium: "\u296F",
  Rfr: "\u211C",
  Rho: "\u03A1",
  RightAngleBracket: "\u27E9",
  RightArrow: "\u2192",
  RightArrowBar: "\u21E5",
  RightArrowLeftArrow: "\u21C4",
  RightCeiling: "\u2309",
  RightDoubleBracket: "\u27E7",
  RightDownTeeVector: "\u295D",
  RightDownVector: "\u21C2",
  RightDownVectorBar: "\u2955",
  RightFloor: "\u230B",
  RightTee: "\u22A2",
  RightTeeArrow: "\u21A6",
  RightTeeVector: "\u295B",
  RightTriangle: "\u22B3",
  RightTriangleBar: "\u29D0",
  RightTriangleEqual: "\u22B5",
  RightUpDownVector: "\u294F",
  RightUpTeeVector: "\u295C",
  RightUpVector: "\u21BE",
  RightUpVectorBar: "\u2954",
  RightVector: "\u21C0",
  RightVectorBar: "\u2953",
  Rightarrow: "\u21D2",
  Ropf: "\u211D",
  RoundImplies: "\u2970",
  Rrightarrow: "\u21DB",
  Rscr: "\u211B",
  Rsh: "\u21B1",
  RuleDelayed: "\u29F4",
  SHCHcy: "\u0429",
  SHcy: "\u0428",
  SOFTcy: "\u042C",
  Sacute: "\u015A",
  Sc: "\u2ABC",
  Scaron: "\u0160",
  Scedil: "\u015E",
  Scirc: "\u015C",
  Scy: "\u0421",
  Sfr: "\u{1D516}",
  ShortDownArrow: "\u2193",
  ShortLeftArrow: "\u2190",
  ShortRightArrow: "\u2192",
  ShortUpArrow: "\u2191",
  Sigma: "\u03A3",
  SmallCircle: "\u2218",
  Sopf: "\u{1D54A}",
  Sqrt: "\u221A",
  Square: "\u25A1",
  SquareIntersection: "\u2293",
  SquareSubset: "\u228F",
  SquareSubsetEqual: "\u2291",
  SquareSuperset: "\u2290",
  SquareSupersetEqual: "\u2292",
  SquareUnion: "\u2294",
  Sscr: "\u{1D4AE}",
  Star: "\u22C6",
  Sub: "\u22D0",
  Subset: "\u22D0",
  SubsetEqual: "\u2286",
  Succeeds: "\u227B",
  SucceedsEqual: "\u2AB0",
  SucceedsSlantEqual: "\u227D",
  SucceedsTilde: "\u227F",
  SuchThat: "\u220B",
  Sum: "\u2211",
  Sup: "\u22D1",
  Superset: "\u2283",
  SupersetEqual: "\u2287",
  Supset: "\u22D1",
  THORN: "\xDE",
  TRADE: "\u2122",
  TSHcy: "\u040B",
  TScy: "\u0426",
  Tab: "	",
  Tau: "\u03A4",
  Tcaron: "\u0164",
  Tcedil: "\u0162",
  Tcy: "\u0422",
  Tfr: "\u{1D517}",
  Therefore: "\u2234",
  Theta: "\u0398",
  ThickSpace: "\u205F\u200A",
  ThinSpace: "\u2009",
  Tilde: "\u223C",
  TildeEqual: "\u2243",
  TildeFullEqual: "\u2245",
  TildeTilde: "\u2248",
  Topf: "\u{1D54B}",
  TripleDot: "\u20DB",
  Tscr: "\u{1D4AF}",
  Tstrok: "\u0166",
  Uacute: "\xDA",
  Uarr: "\u219F",
  Uarrocir: "\u2949",
  Ubrcy: "\u040E",
  Ubreve: "\u016C",
  Ucirc: "\xDB",
  Ucy: "\u0423",
  Udblac: "\u0170",
  Ufr: "\u{1D518}",
  Ugrave: "\xD9",
  Umacr: "\u016A",
  UnderBar: "_",
  UnderBrace: "\u23DF",
  UnderBracket: "\u23B5",
  UnderParenthesis: "\u23DD",
  Union: "\u22C3",
  UnionPlus: "\u228E",
  Uogon: "\u0172",
  Uopf: "\u{1D54C}",
  UpArrow: "\u2191",
  UpArrowBar: "\u2912",
  UpArrowDownArrow: "\u21C5",
  UpDownArrow: "\u2195",
  UpEquilibrium: "\u296E",
  UpTee: "\u22A5",
  UpTeeArrow: "\u21A5",
  Uparrow: "\u21D1",
  Updownarrow: "\u21D5",
  UpperLeftArrow: "\u2196",
  UpperRightArrow: "\u2197",
  Upsi: "\u03D2",
  Upsilon: "\u03A5",
  Uring: "\u016E",
  Uscr: "\u{1D4B0}",
  Utilde: "\u0168",
  Uuml: "\xDC",
  VDash: "\u22AB",
  Vbar: "\u2AEB",
  Vcy: "\u0412",
  Vdash: "\u22A9",
  Vdashl: "\u2AE6",
  Vee: "\u22C1",
  Verbar: "\u2016",
  Vert: "\u2016",
  VerticalBar: "\u2223",
  VerticalLine: "|",
  VerticalSeparator: "\u2758",
  VerticalTilde: "\u2240",
  VeryThinSpace: "\u200A",
  Vfr: "\u{1D519}",
  Vopf: "\u{1D54D}",
  Vscr: "\u{1D4B1}",
  Vvdash: "\u22AA",
  Wcirc: "\u0174",
  Wedge: "\u22C0",
  Wfr: "\u{1D51A}",
  Wopf: "\u{1D54E}",
  Wscr: "\u{1D4B2}",
  Xfr: "\u{1D51B}",
  Xi: "\u039E",
  Xopf: "\u{1D54F}",
  Xscr: "\u{1D4B3}",
  YAcy: "\u042F",
  YIcy: "\u0407",
  YUcy: "\u042E",
  Yacute: "\xDD",
  Ycirc: "\u0176",
  Ycy: "\u042B",
  Yfr: "\u{1D51C}",
  Yopf: "\u{1D550}",
  Yscr: "\u{1D4B4}",
  Yuml: "\u0178",
  ZHcy: "\u0416",
  Zacute: "\u0179",
  Zcaron: "\u017D",
  Zcy: "\u0417",
  Zdot: "\u017B",
  ZeroWidthSpace: "\u200B",
  Zeta: "\u0396",
  Zfr: "\u2128",
  Zopf: "\u2124",
  Zscr: "\u{1D4B5}",
  aacute: "\xE1",
  abreve: "\u0103",
  ac: "\u223E",
  acE: "\u223E\u0333",
  acd: "\u223F",
  acirc: "\xE2",
  acute: "\xB4",
  acy: "\u0430",
  aelig: "\xE6",
  af: "\u2061",
  afr: "\u{1D51E}",
  agrave: "\xE0",
  alefsym: "\u2135",
  aleph: "\u2135",
  alpha: "\u03B1",
  amacr: "\u0101",
  amalg: "\u2A3F",
  and: "\u2227",
  andand: "\u2A55",
  andd: "\u2A5C",
  andslope: "\u2A58",
  andv: "\u2A5A",
  ang: "\u2220",
  ange: "\u29A4",
  angle: "\u2220",
  angmsd: "\u2221",
  angmsdaa: "\u29A8",
  angmsdab: "\u29A9",
  angmsdac: "\u29AA",
  angmsdad: "\u29AB",
  angmsdae: "\u29AC",
  angmsdaf: "\u29AD",
  angmsdag: "\u29AE",
  angmsdah: "\u29AF",
  angrt: "\u221F",
  angrtvb: "\u22BE",
  angrtvbd: "\u299D",
  angsph: "\u2222",
  angst: "\xC5",
  angzarr: "\u237C",
  aogon: "\u0105",
  aopf: "\u{1D552}",
  ap: "\u2248",
  apE: "\u2A70",
  apacir: "\u2A6F",
  ape: "\u224A",
  apid: "\u224B",
  approx: "\u2248",
  approxeq: "\u224A",
  aring: "\xE5",
  ascr: "\u{1D4B6}",
  ast: "*",
  asymp: "\u2248",
  asympeq: "\u224D",
  atilde: "\xE3",
  auml: "\xE4",
  awconint: "\u2233",
  awint: "\u2A11",
  bNot: "\u2AED",
  backcong: "\u224C",
  backepsilon: "\u03F6",
  backprime: "\u2035",
  backsim: "\u223D",
  backsimeq: "\u22CD",
  barvee: "\u22BD",
  barwed: "\u2305",
  barwedge: "\u2305",
  bbrk: "\u23B5",
  bbrktbrk: "\u23B6",
  bcong: "\u224C",
  bcy: "\u0431",
  bdquo: "\u201E",
  becaus: "\u2235",
  because: "\u2235",
  bemptyv: "\u29B0",
  bepsi: "\u03F6",
  bernou: "\u212C",
  beta: "\u03B2",
  beth: "\u2136",
  between: "\u226C",
  bfr: "\u{1D51F}",
  bigcap: "\u22C2",
  bigcirc: "\u25EF",
  bigcup: "\u22C3",
  bigodot: "\u2A00",
  bigoplus: "\u2A01",
  bigotimes: "\u2A02",
  bigsqcup: "\u2A06",
  bigstar: "\u2605",
  bigtriangledown: "\u25BD",
  bigtriangleup: "\u25B3",
  biguplus: "\u2A04",
  bigvee: "\u22C1",
  bigwedge: "\u22C0",
  bkarow: "\u290D",
  blacklozenge: "\u29EB",
  blacksquare: "\u25AA",
  blacktriangle: "\u25B4",
  blacktriangledown: "\u25BE",
  blacktriangleleft: "\u25C2",
  blacktriangleright: "\u25B8",
  blank: "\u2423",
  blk12: "\u2592",
  blk14: "\u2591",
  blk34: "\u2593",
  block: "\u2588",
  bne: "=\u20E5",
  bnequiv: "\u2261\u20E5",
  bnot: "\u2310",
  bopf: "\u{1D553}",
  bot: "\u22A5",
  bottom: "\u22A5",
  bowtie: "\u22C8",
  boxDL: "\u2557",
  boxDR: "\u2554",
  boxDl: "\u2556",
  boxDr: "\u2553",
  boxH: "\u2550",
  boxHD: "\u2566",
  boxHU: "\u2569",
  boxHd: "\u2564",
  boxHu: "\u2567",
  boxUL: "\u255D",
  boxUR: "\u255A",
  boxUl: "\u255C",
  boxUr: "\u2559",
  boxV: "\u2551",
  boxVH: "\u256C",
  boxVL: "\u2563",
  boxVR: "\u2560",
  boxVh: "\u256B",
  boxVl: "\u2562",
  boxVr: "\u255F",
  boxbox: "\u29C9",
  boxdL: "\u2555",
  boxdR: "\u2552",
  boxdl: "\u2510",
  boxdr: "\u250C",
  boxh: "\u2500",
  boxhD: "\u2565",
  boxhU: "\u2568",
  boxhd: "\u252C",
  boxhu: "\u2534",
  boxminus: "\u229F",
  boxplus: "\u229E",
  boxtimes: "\u22A0",
  boxuL: "\u255B",
  boxuR: "\u2558",
  boxul: "\u2518",
  boxur: "\u2514",
  boxv: "\u2502",
  boxvH: "\u256A",
  boxvL: "\u2561",
  boxvR: "\u255E",
  boxvh: "\u253C",
  boxvl: "\u2524",
  boxvr: "\u251C",
  bprime: "\u2035",
  breve: "\u02D8",
  brvbar: "\xA6",
  bscr: "\u{1D4B7}",
  bsemi: "\u204F",
  bsim: "\u223D",
  bsime: "\u22CD",
  bsol: "\\",
  bsolb: "\u29C5",
  bsolhsub: "\u27C8",
  bull: "\u2022",
  bullet: "\u2022",
  bump: "\u224E",
  bumpE: "\u2AAE",
  bumpe: "\u224F",
  bumpeq: "\u224F",
  cacute: "\u0107",
  cap: "\u2229",
  capand: "\u2A44",
  capbrcup: "\u2A49",
  capcap: "\u2A4B",
  capcup: "\u2A47",
  capdot: "\u2A40",
  caps: "\u2229\uFE00",
  caret: "\u2041",
  caron: "\u02C7",
  ccaps: "\u2A4D",
  ccaron: "\u010D",
  ccedil: "\xE7",
  ccirc: "\u0109",
  ccups: "\u2A4C",
  ccupssm: "\u2A50",
  cdot: "\u010B",
  cedil: "\xB8",
  cemptyv: "\u29B2",
  cent: "\xA2",
  centerdot: "\xB7",
  cfr: "\u{1D520}",
  chcy: "\u0447",
  check: "\u2713",
  checkmark: "\u2713",
  chi: "\u03C7",
  cir: "\u25CB",
  cirE: "\u29C3",
  circ: "\u02C6",
  circeq: "\u2257",
  circlearrowleft: "\u21BA",
  circlearrowright: "\u21BB",
  circledR: "\xAE",
  circledS: "\u24C8",
  circledast: "\u229B",
  circledcirc: "\u229A",
  circleddash: "\u229D",
  cire: "\u2257",
  cirfnint: "\u2A10",
  cirmid: "\u2AEF",
  cirscir: "\u29C2",
  clubs: "\u2663",
  clubsuit: "\u2663",
  colon: ":",
  colone: "\u2254",
  coloneq: "\u2254",
  comma: ",",
  commat: "@",
  comp: "\u2201",
  compfn: "\u2218",
  complement: "\u2201",
  complexes: "\u2102",
  cong: "\u2245",
  congdot: "\u2A6D",
  conint: "\u222E",
  copf: "\u{1D554}",
  coprod: "\u2210",
  copy: "\xA9",
  copysr: "\u2117",
  crarr: "\u21B5",
  cross: "\u2717",
  cscr: "\u{1D4B8}",
  csub: "\u2ACF",
  csube: "\u2AD1",
  csup: "\u2AD0",
  csupe: "\u2AD2",
  ctdot: "\u22EF",
  cudarrl: "\u2938",
  cudarrr: "\u2935",
  cuepr: "\u22DE",
  cuesc: "\u22DF",
  cularr: "\u21B6",
  cularrp: "\u293D",
  cup: "\u222A",
  cupbrcap: "\u2A48",
  cupcap: "\u2A46",
  cupcup: "\u2A4A",
  cupdot: "\u228D",
  cupor: "\u2A45",
  cups: "\u222A\uFE00",
  curarr: "\u21B7",
  curarrm: "\u293C",
  curlyeqprec: "\u22DE",
  curlyeqsucc: "\u22DF",
  curlyvee: "\u22CE",
  curlywedge: "\u22CF",
  curren: "\xA4",
  curvearrowleft: "\u21B6",
  curvearrowright: "\u21B7",
  cuvee: "\u22CE",
  cuwed: "\u22CF",
  cwconint: "\u2232",
  cwint: "\u2231",
  cylcty: "\u232D",
  dArr: "\u21D3",
  dHar: "\u2965",
  dagger: "\u2020",
  daleth: "\u2138",
  darr: "\u2193",
  dash: "\u2010",
  dashv: "\u22A3",
  dbkarow: "\u290F",
  dblac: "\u02DD",
  dcaron: "\u010F",
  dcy: "\u0434",
  dd: "\u2146",
  ddagger: "\u2021",
  ddarr: "\u21CA",
  ddotseq: "\u2A77",
  deg: "\xB0",
  delta: "\u03B4",
  demptyv: "\u29B1",
  dfisht: "\u297F",
  dfr: "\u{1D521}",
  dharl: "\u21C3",
  dharr: "\u21C2",
  diam: "\u22C4",
  diamond: "\u22C4",
  diamondsuit: "\u2666",
  diams: "\u2666",
  die: "\xA8",
  digamma: "\u03DD",
  disin: "\u22F2",
  div: "\xF7",
  divide: "\xF7",
  divideontimes: "\u22C7",
  divonx: "\u22C7",
  djcy: "\u0452",
  dlcorn: "\u231E",
  dlcrop: "\u230D",
  dollar: "$",
  dopf: "\u{1D555}",
  dot: "\u02D9",
  doteq: "\u2250",
  doteqdot: "\u2251",
  dotminus: "\u2238",
  dotplus: "\u2214",
  dotsquare: "\u22A1",
  doublebarwedge: "\u2306",
  downarrow: "\u2193",
  downdownarrows: "\u21CA",
  downharpoonleft: "\u21C3",
  downharpoonright: "\u21C2",
  drbkarow: "\u2910",
  drcorn: "\u231F",
  drcrop: "\u230C",
  dscr: "\u{1D4B9}",
  dscy: "\u0455",
  dsol: "\u29F6",
  dstrok: "\u0111",
  dtdot: "\u22F1",
  dtri: "\u25BF",
  dtrif: "\u25BE",
  duarr: "\u21F5",
  duhar: "\u296F",
  dwangle: "\u29A6",
  dzcy: "\u045F",
  dzigrarr: "\u27FF",
  eDDot: "\u2A77",
  eDot: "\u2251",
  eacute: "\xE9",
  easter: "\u2A6E",
  ecaron: "\u011B",
  ecir: "\u2256",
  ecirc: "\xEA",
  ecolon: "\u2255",
  ecy: "\u044D",
  edot: "\u0117",
  ee: "\u2147",
  efDot: "\u2252",
  efr: "\u{1D522}",
  eg: "\u2A9A",
  egrave: "\xE8",
  egs: "\u2A96",
  egsdot: "\u2A98",
  el: "\u2A99",
  elinters: "\u23E7",
  ell: "\u2113",
  els: "\u2A95",
  elsdot: "\u2A97",
  emacr: "\u0113",
  empty: "\u2205",
  emptyset: "\u2205",
  emptyv: "\u2205",
  emsp: "\u2003",
  emsp13: "\u2004",
  emsp14: "\u2005",
  eng: "\u014B",
  ensp: "\u2002",
  eogon: "\u0119",
  eopf: "\u{1D556}",
  epar: "\u22D5",
  eparsl: "\u29E3",
  eplus: "\u2A71",
  epsi: "\u03B5",
  epsilon: "\u03B5",
  epsiv: "\u03F5",
  eqcirc: "\u2256",
  eqcolon: "\u2255",
  eqsim: "\u2242",
  eqslantgtr: "\u2A96",
  eqslantless: "\u2A95",
  equals: "=",
  equest: "\u225F",
  equiv: "\u2261",
  equivDD: "\u2A78",
  eqvparsl: "\u29E5",
  erDot: "\u2253",
  erarr: "\u2971",
  escr: "\u212F",
  esdot: "\u2250",
  esim: "\u2242",
  eta: "\u03B7",
  eth: "\xF0",
  euml: "\xEB",
  euro: "\u20AC",
  excl: "!",
  exist: "\u2203",
  expectation: "\u2130",
  exponentiale: "\u2147",
  fallingdotseq: "\u2252",
  fcy: "\u0444",
  female: "\u2640",
  ffilig: "\uFB03",
  fflig: "\uFB00",
  ffllig: "\uFB04",
  ffr: "\u{1D523}",
  filig: "\uFB01",
  fjlig: "fj",
  flat: "\u266D",
  fllig: "\uFB02",
  fltns: "\u25B1",
  fnof: "\u0192",
  fopf: "\u{1D557}",
  forall: "\u2200",
  fork: "\u22D4",
  forkv: "\u2AD9",
  fpartint: "\u2A0D",
  frac12: "\xBD",
  frac13: "\u2153",
  frac14: "\xBC",
  frac15: "\u2155",
  frac16: "\u2159",
  frac18: "\u215B",
  frac23: "\u2154",
  frac25: "\u2156",
  frac34: "\xBE",
  frac35: "\u2157",
  frac38: "\u215C",
  frac45: "\u2158",
  frac56: "\u215A",
  frac58: "\u215D",
  frac78: "\u215E",
  frasl: "\u2044",
  frown: "\u2322",
  fscr: "\u{1D4BB}",
  gE: "\u2267",
  gEl: "\u2A8C",
  gacute: "\u01F5",
  gamma: "\u03B3",
  gammad: "\u03DD",
  gap: "\u2A86",
  gbreve: "\u011F",
  gcirc: "\u011D",
  gcy: "\u0433",
  gdot: "\u0121",
  ge: "\u2265",
  gel: "\u22DB",
  geq: "\u2265",
  geqq: "\u2267",
  geqslant: "\u2A7E",
  ges: "\u2A7E",
  gescc: "\u2AA9",
  gesdot: "\u2A80",
  gesdoto: "\u2A82",
  gesdotol: "\u2A84",
  gesl: "\u22DB\uFE00",
  gesles: "\u2A94",
  gfr: "\u{1D524}",
  gg: "\u226B",
  ggg: "\u22D9",
  gimel: "\u2137",
  gjcy: "\u0453",
  gl: "\u2277",
  glE: "\u2A92",
  gla: "\u2AA5",
  glj: "\u2AA4",
  gnE: "\u2269",
  gnap: "\u2A8A",
  gnapprox: "\u2A8A",
  gne: "\u2A88",
  gneq: "\u2A88",
  gneqq: "\u2269",
  gnsim: "\u22E7",
  gopf: "\u{1D558}",
  grave: "`",
  gscr: "\u210A",
  gsim: "\u2273",
  gsime: "\u2A8E",
  gsiml: "\u2A90",
  gtcc: "\u2AA7",
  gtcir: "\u2A7A",
  gtdot: "\u22D7",
  gtlPar: "\u2995",
  gtquest: "\u2A7C",
  gtrapprox: "\u2A86",
  gtrarr: "\u2978",
  gtrdot: "\u22D7",
  gtreqless: "\u22DB",
  gtreqqless: "\u2A8C",
  gtrless: "\u2277",
  gtrsim: "\u2273",
  gvertneqq: "\u2269\uFE00",
  gvnE: "\u2269\uFE00",
  hArr: "\u21D4",
  hairsp: "\u200A",
  half: "\xBD",
  hamilt: "\u210B",
  hardcy: "\u044A",
  harr: "\u2194",
  harrcir: "\u2948",
  harrw: "\u21AD",
  hbar: "\u210F",
  hcirc: "\u0125",
  hearts: "\u2665",
  heartsuit: "\u2665",
  hellip: "\u2026",
  hercon: "\u22B9",
  hfr: "\u{1D525}",
  hksearow: "\u2925",
  hkswarow: "\u2926",
  hoarr: "\u21FF",
  homtht: "\u223B",
  hookleftarrow: "\u21A9",
  hookrightarrow: "\u21AA",
  hopf: "\u{1D559}",
  horbar: "\u2015",
  hscr: "\u{1D4BD}",
  hslash: "\u210F",
  hstrok: "\u0127",
  hybull: "\u2043",
  hyphen: "\u2010",
  iacute: "\xED",
  ic: "\u2063",
  icirc: "\xEE",
  icy: "\u0438",
  iecy: "\u0435",
  iexcl: "\xA1",
  iff: "\u21D4",
  ifr: "\u{1D526}",
  igrave: "\xEC",
  ii: "\u2148",
  iiiint: "\u2A0C",
  iiint: "\u222D",
  iinfin: "\u29DC",
  iiota: "\u2129",
  ijlig: "\u0133",
  imacr: "\u012B",
  image: "\u2111",
  imagline: "\u2110",
  imagpart: "\u2111",
  imath: "\u0131",
  imof: "\u22B7",
  imped: "\u01B5",
  in: "\u2208",
  incare: "\u2105",
  infin: "\u221E",
  infintie: "\u29DD",
  inodot: "\u0131",
  int: "\u222B",
  intcal: "\u22BA",
  integers: "\u2124",
  intercal: "\u22BA",
  intlarhk: "\u2A17",
  intprod: "\u2A3C",
  iocy: "\u0451",
  iogon: "\u012F",
  iopf: "\u{1D55A}",
  iota: "\u03B9",
  iprod: "\u2A3C",
  iquest: "\xBF",
  iscr: "\u{1D4BE}",
  isin: "\u2208",
  isinE: "\u22F9",
  isindot: "\u22F5",
  isins: "\u22F4",
  isinsv: "\u22F3",
  isinv: "\u2208",
  it: "\u2062",
  itilde: "\u0129",
  iukcy: "\u0456",
  iuml: "\xEF",
  jcirc: "\u0135",
  jcy: "\u0439",
  jfr: "\u{1D527}",
  jmath: "\u0237",
  jopf: "\u{1D55B}",
  jscr: "\u{1D4BF}",
  jsercy: "\u0458",
  jukcy: "\u0454",
  kappa: "\u03BA",
  kappav: "\u03F0",
  kcedil: "\u0137",
  kcy: "\u043A",
  kfr: "\u{1D528}",
  kgreen: "\u0138",
  khcy: "\u0445",
  kjcy: "\u045C",
  kopf: "\u{1D55C}",
  kscr: "\u{1D4C0}",
  lAarr: "\u21DA",
  lArr: "\u21D0",
  lAtail: "\u291B",
  lBarr: "\u290E",
  lE: "\u2266",
  lEg: "\u2A8B",
  lHar: "\u2962",
  lacute: "\u013A",
  laemptyv: "\u29B4",
  lagran: "\u2112",
  lambda: "\u03BB",
  lang: "\u27E8",
  langd: "\u2991",
  langle: "\u27E8",
  lap: "\u2A85",
  laquo: "\xAB",
  larr: "\u2190",
  larrb: "\u21E4",
  larrbfs: "\u291F",
  larrfs: "\u291D",
  larrhk: "\u21A9",
  larrlp: "\u21AB",
  larrpl: "\u2939",
  larrsim: "\u2973",
  larrtl: "\u21A2",
  lat: "\u2AAB",
  latail: "\u2919",
  late: "\u2AAD",
  lates: "\u2AAD\uFE00",
  lbarr: "\u290C",
  lbbrk: "\u2772",
  lbrace: "{",
  lbrack: "[",
  lbrke: "\u298B",
  lbrksld: "\u298F",
  lbrkslu: "\u298D",
  lcaron: "\u013E",
  lcedil: "\u013C",
  lceil: "\u2308",
  lcub: "{",
  lcy: "\u043B",
  ldca: "\u2936",
  ldquo: "\u201C",
  ldquor: "\u201E",
  ldrdhar: "\u2967",
  ldrushar: "\u294B",
  ldsh: "\u21B2",
  le: "\u2264",
  leftarrow: "\u2190",
  leftarrowtail: "\u21A2",
  leftharpoondown: "\u21BD",
  leftharpoonup: "\u21BC",
  leftleftarrows: "\u21C7",
  leftrightarrow: "\u2194",
  leftrightarrows: "\u21C6",
  leftrightharpoons: "\u21CB",
  leftrightsquigarrow: "\u21AD",
  leftthreetimes: "\u22CB",
  leg: "\u22DA",
  leq: "\u2264",
  leqq: "\u2266",
  leqslant: "\u2A7D",
  les: "\u2A7D",
  lescc: "\u2AA8",
  lesdot: "\u2A7F",
  lesdoto: "\u2A81",
  lesdotor: "\u2A83",
  lesg: "\u22DA\uFE00",
  lesges: "\u2A93",
  lessapprox: "\u2A85",
  lessdot: "\u22D6",
  lesseqgtr: "\u22DA",
  lesseqqgtr: "\u2A8B",
  lessgtr: "\u2276",
  lesssim: "\u2272",
  lfisht: "\u297C",
  lfloor: "\u230A",
  lfr: "\u{1D529}",
  lg: "\u2276",
  lgE: "\u2A91",
  lhard: "\u21BD",
  lharu: "\u21BC",
  lharul: "\u296A",
  lhblk: "\u2584",
  ljcy: "\u0459",
  ll: "\u226A",
  llarr: "\u21C7",
  llcorner: "\u231E",
  llhard: "\u296B",
  lltri: "\u25FA",
  lmidot: "\u0140",
  lmoust: "\u23B0",
  lmoustache: "\u23B0",
  lnE: "\u2268",
  lnap: "\u2A89",
  lnapprox: "\u2A89",
  lne: "\u2A87",
  lneq: "\u2A87",
  lneqq: "\u2268",
  lnsim: "\u22E6",
  loang: "\u27EC",
  loarr: "\u21FD",
  lobrk: "\u27E6",
  longleftarrow: "\u27F5",
  longleftrightarrow: "\u27F7",
  longmapsto: "\u27FC",
  longrightarrow: "\u27F6",
  looparrowleft: "\u21AB",
  looparrowright: "\u21AC",
  lopar: "\u2985",
  lopf: "\u{1D55D}",
  loplus: "\u2A2D",
  lotimes: "\u2A34",
  lowast: "\u2217",
  lowbar: "_",
  loz: "\u25CA",
  lozenge: "\u25CA",
  lozf: "\u29EB",
  lpar: "(",
  lparlt: "\u2993",
  lrarr: "\u21C6",
  lrcorner: "\u231F",
  lrhar: "\u21CB",
  lrhard: "\u296D",
  lrm: "\u200E",
  lrtri: "\u22BF",
  lsaquo: "\u2039",
  lscr: "\u{1D4C1}",
  lsh: "\u21B0",
  lsim: "\u2272",
  lsime: "\u2A8D",
  lsimg: "\u2A8F",
  lsqb: "[",
  lsquo: "\u2018",
  lsquor: "\u201A",
  lstrok: "\u0142",
  ltcc: "\u2AA6",
  ltcir: "\u2A79",
  ltdot: "\u22D6",
  lthree: "\u22CB",
  ltimes: "\u22C9",
  ltlarr: "\u2976",
  ltquest: "\u2A7B",
  ltrPar: "\u2996",
  ltri: "\u25C3",
  ltrie: "\u22B4",
  ltrif: "\u25C2",
  lurdshar: "\u294A",
  luruhar: "\u2966",
  lvertneqq: "\u2268\uFE00",
  lvnE: "\u2268\uFE00",
  mDDot: "\u223A",
  macr: "\xAF",
  male: "\u2642",
  malt: "\u2720",
  maltese: "\u2720",
  map: "\u21A6",
  mapsto: "\u21A6",
  mapstodown: "\u21A7",
  mapstoleft: "\u21A4",
  mapstoup: "\u21A5",
  marker: "\u25AE",
  mcomma: "\u2A29",
  mcy: "\u043C",
  mdash: "\u2014",
  measuredangle: "\u2221",
  mfr: "\u{1D52A}",
  mho: "\u2127",
  micro: "\xB5",
  mid: "\u2223",
  midast: "*",
  midcir: "\u2AF0",
  middot: "\xB7",
  minus: "\u2212",
  minusb: "\u229F",
  minusd: "\u2238",
  minusdu: "\u2A2A",
  mlcp: "\u2ADB",
  mldr: "\u2026",
  mnplus: "\u2213",
  models: "\u22A7",
  mopf: "\u{1D55E}",
  mp: "\u2213",
  mscr: "\u{1D4C2}",
  mstpos: "\u223E",
  mu: "\u03BC",
  multimap: "\u22B8",
  mumap: "\u22B8",
  nGg: "\u22D9\u0338",
  nGt: "\u226B\u20D2",
  nGtv: "\u226B\u0338",
  nLeftarrow: "\u21CD",
  nLeftrightarrow: "\u21CE",
  nLl: "\u22D8\u0338",
  nLt: "\u226A\u20D2",
  nLtv: "\u226A\u0338",
  nRightarrow: "\u21CF",
  nVDash: "\u22AF",
  nVdash: "\u22AE",
  nabla: "\u2207",
  nacute: "\u0144",
  nang: "\u2220\u20D2",
  nap: "\u2249",
  napE: "\u2A70\u0338",
  napid: "\u224B\u0338",
  napos: "\u0149",
  napprox: "\u2249",
  natur: "\u266E",
  natural: "\u266E",
  naturals: "\u2115",
  nbsp: "\xA0",
  nbump: "\u224E\u0338",
  nbumpe: "\u224F\u0338",
  ncap: "\u2A43",
  ncaron: "\u0148",
  ncedil: "\u0146",
  ncong: "\u2247",
  ncongdot: "\u2A6D\u0338",
  ncup: "\u2A42",
  ncy: "\u043D",
  ndash: "\u2013",
  ne: "\u2260",
  neArr: "\u21D7",
  nearhk: "\u2924",
  nearr: "\u2197",
  nearrow: "\u2197",
  nedot: "\u2250\u0338",
  nequiv: "\u2262",
  nesear: "\u2928",
  nesim: "\u2242\u0338",
  nexist: "\u2204",
  nexists: "\u2204",
  nfr: "\u{1D52B}",
  ngE: "\u2267\u0338",
  nge: "\u2271",
  ngeq: "\u2271",
  ngeqq: "\u2267\u0338",
  ngeqslant: "\u2A7E\u0338",
  nges: "\u2A7E\u0338",
  ngsim: "\u2275",
  ngt: "\u226F",
  ngtr: "\u226F",
  nhArr: "\u21CE",
  nharr: "\u21AE",
  nhpar: "\u2AF2",
  ni: "\u220B",
  nis: "\u22FC",
  nisd: "\u22FA",
  niv: "\u220B",
  njcy: "\u045A",
  nlArr: "\u21CD",
  nlE: "\u2266\u0338",
  nlarr: "\u219A",
  nldr: "\u2025",
  nle: "\u2270",
  nleftarrow: "\u219A",
  nleftrightarrow: "\u21AE",
  nleq: "\u2270",
  nleqq: "\u2266\u0338",
  nleqslant: "\u2A7D\u0338",
  nles: "\u2A7D\u0338",
  nless: "\u226E",
  nlsim: "\u2274",
  nlt: "\u226E",
  nltri: "\u22EA",
  nltrie: "\u22EC",
  nmid: "\u2224",
  nopf: "\u{1D55F}",
  not: "\xAC",
  notin: "\u2209",
  notinE: "\u22F9\u0338",
  notindot: "\u22F5\u0338",
  notinva: "\u2209",
  notinvb: "\u22F7",
  notinvc: "\u22F6",
  notni: "\u220C",
  notniva: "\u220C",
  notnivb: "\u22FE",
  notnivc: "\u22FD",
  npar: "\u2226",
  nparallel: "\u2226",
  nparsl: "\u2AFD\u20E5",
  npart: "\u2202\u0338",
  npolint: "\u2A14",
  npr: "\u2280",
  nprcue: "\u22E0",
  npre: "\u2AAF\u0338",
  nprec: "\u2280",
  npreceq: "\u2AAF\u0338",
  nrArr: "\u21CF",
  nrarr: "\u219B",
  nrarrc: "\u2933\u0338",
  nrarrw: "\u219D\u0338",
  nrightarrow: "\u219B",
  nrtri: "\u22EB",
  nrtrie: "\u22ED",
  nsc: "\u2281",
  nsccue: "\u22E1",
  nsce: "\u2AB0\u0338",
  nscr: "\u{1D4C3}",
  nshortmid: "\u2224",
  nshortparallel: "\u2226",
  nsim: "\u2241",
  nsime: "\u2244",
  nsimeq: "\u2244",
  nsmid: "\u2224",
  nspar: "\u2226",
  nsqsube: "\u22E2",
  nsqsupe: "\u22E3",
  nsub: "\u2284",
  nsubE: "\u2AC5\u0338",
  nsube: "\u2288",
  nsubset: "\u2282\u20D2",
  nsubseteq: "\u2288",
  nsubseteqq: "\u2AC5\u0338",
  nsucc: "\u2281",
  nsucceq: "\u2AB0\u0338",
  nsup: "\u2285",
  nsupE: "\u2AC6\u0338",
  nsupe: "\u2289",
  nsupset: "\u2283\u20D2",
  nsupseteq: "\u2289",
  nsupseteqq: "\u2AC6\u0338",
  ntgl: "\u2279",
  ntilde: "\xF1",
  ntlg: "\u2278",
  ntriangleleft: "\u22EA",
  ntrianglelefteq: "\u22EC",
  ntriangleright: "\u22EB",
  ntrianglerighteq: "\u22ED",
  nu: "\u03BD",
  num: "#",
  numero: "\u2116",
  numsp: "\u2007",
  nvDash: "\u22AD",
  nvHarr: "\u2904",
  nvap: "\u224D\u20D2",
  nvdash: "\u22AC",
  nvge: "\u2265\u20D2",
  nvgt: ">\u20D2",
  nvinfin: "\u29DE",
  nvlArr: "\u2902",
  nvle: "\u2264\u20D2",
  nvlt: "<\u20D2",
  nvltrie: "\u22B4\u20D2",
  nvrArr: "\u2903",
  nvrtrie: "\u22B5\u20D2",
  nvsim: "\u223C\u20D2",
  nwArr: "\u21D6",
  nwarhk: "\u2923",
  nwarr: "\u2196",
  nwarrow: "\u2196",
  nwnear: "\u2927",
  oS: "\u24C8",
  oacute: "\xF3",
  oast: "\u229B",
  ocir: "\u229A",
  ocirc: "\xF4",
  ocy: "\u043E",
  odash: "\u229D",
  odblac: "\u0151",
  odiv: "\u2A38",
  odot: "\u2299",
  odsold: "\u29BC",
  oelig: "\u0153",
  ofcir: "\u29BF",
  ofr: "\u{1D52C}",
  ogon: "\u02DB",
  ograve: "\xF2",
  ogt: "\u29C1",
  ohbar: "\u29B5",
  ohm: "\u03A9",
  oint: "\u222E",
  olarr: "\u21BA",
  olcir: "\u29BE",
  olcross: "\u29BB",
  oline: "\u203E",
  olt: "\u29C0",
  omacr: "\u014D",
  omega: "\u03C9",
  omicron: "\u03BF",
  omid: "\u29B6",
  ominus: "\u2296",
  oopf: "\u{1D560}",
  opar: "\u29B7",
  operp: "\u29B9",
  oplus: "\u2295",
  or: "\u2228",
  orarr: "\u21BB",
  ord: "\u2A5D",
  order: "\u2134",
  orderof: "\u2134",
  ordf: "\xAA",
  ordm: "\xBA",
  origof: "\u22B6",
  oror: "\u2A56",
  orslope: "\u2A57",
  orv: "\u2A5B",
  oscr: "\u2134",
  oslash: "\xF8",
  osol: "\u2298",
  otilde: "\xF5",
  otimes: "\u2297",
  otimesas: "\u2A36",
  ouml: "\xF6",
  ovbar: "\u233D",
  par: "\u2225",
  para: "\xB6",
  parallel: "\u2225",
  parsim: "\u2AF3",
  parsl: "\u2AFD",
  part: "\u2202",
  pcy: "\u043F",
  percnt: "%",
  period: ".",
  permil: "\u2030",
  perp: "\u22A5",
  pertenk: "\u2031",
  pfr: "\u{1D52D}",
  phi: "\u03C6",
  phiv: "\u03D5",
  phmmat: "\u2133",
  phone: "\u260E",
  pi: "\u03C0",
  pitchfork: "\u22D4",
  piv: "\u03D6",
  planck: "\u210F",
  planckh: "\u210E",
  plankv: "\u210F",
  plus: "+",
  plusacir: "\u2A23",
  plusb: "\u229E",
  pluscir: "\u2A22",
  plusdo: "\u2214",
  plusdu: "\u2A25",
  pluse: "\u2A72",
  plusmn: "\xB1",
  plussim: "\u2A26",
  plustwo: "\u2A27",
  pm: "\xB1",
  pointint: "\u2A15",
  popf: "\u{1D561}",
  pound: "\xA3",
  pr: "\u227A",
  prE: "\u2AB3",
  prap: "\u2AB7",
  prcue: "\u227C",
  pre: "\u2AAF",
  prec: "\u227A",
  precapprox: "\u2AB7",
  preccurlyeq: "\u227C",
  preceq: "\u2AAF",
  precnapprox: "\u2AB9",
  precneqq: "\u2AB5",
  precnsim: "\u22E8",
  precsim: "\u227E",
  prime: "\u2032",
  primes: "\u2119",
  prnE: "\u2AB5",
  prnap: "\u2AB9",
  prnsim: "\u22E8",
  prod: "\u220F",
  profalar: "\u232E",
  profline: "\u2312",
  profsurf: "\u2313",
  prop: "\u221D",
  propto: "\u221D",
  prsim: "\u227E",
  prurel: "\u22B0",
  pscr: "\u{1D4C5}",
  psi: "\u03C8",
  puncsp: "\u2008",
  qfr: "\u{1D52E}",
  qint: "\u2A0C",
  qopf: "\u{1D562}",
  qprime: "\u2057",
  qscr: "\u{1D4C6}",
  quaternions: "\u210D",
  quatint: "\u2A16",
  quest: "?",
  questeq: "\u225F",
  rAarr: "\u21DB",
  rArr: "\u21D2",
  rAtail: "\u291C",
  rBarr: "\u290F",
  rHar: "\u2964",
  race: "\u223D\u0331",
  racute: "\u0155",
  radic: "\u221A",
  raemptyv: "\u29B3",
  rang: "\u27E9",
  rangd: "\u2992",
  range: "\u29A5",
  rangle: "\u27E9",
  raquo: "\xBB",
  rarr: "\u2192",
  rarrap: "\u2975",
  rarrb: "\u21E5",
  rarrbfs: "\u2920",
  rarrc: "\u2933",
  rarrfs: "\u291E",
  rarrhk: "\u21AA",
  rarrlp: "\u21AC",
  rarrpl: "\u2945",
  rarrsim: "\u2974",
  rarrtl: "\u21A3",
  rarrw: "\u219D",
  ratail: "\u291A",
  ratio: "\u2236",
  rationals: "\u211A",
  rbarr: "\u290D",
  rbbrk: "\u2773",
  rbrace: "}",
  rbrack: "]",
  rbrke: "\u298C",
  rbrksld: "\u298E",
  rbrkslu: "\u2990",
  rcaron: "\u0159",
  rcedil: "\u0157",
  rceil: "\u2309",
  rcub: "}",
  rcy: "\u0440",
  rdca: "\u2937",
  rdldhar: "\u2969",
  rdquo: "\u201D",
  rdquor: "\u201D",
  rdsh: "\u21B3",
  real: "\u211C",
  realine: "\u211B",
  realpart: "\u211C",
  reals: "\u211D",
  rect: "\u25AD",
  reg: "\xAE",
  rfisht: "\u297D",
  rfloor: "\u230B",
  rfr: "\u{1D52F}",
  rhard: "\u21C1",
  rharu: "\u21C0",
  rharul: "\u296C",
  rho: "\u03C1",
  rhov: "\u03F1",
  rightarrow: "\u2192",
  rightarrowtail: "\u21A3",
  rightharpoondown: "\u21C1",
  rightharpoonup: "\u21C0",
  rightleftarrows: "\u21C4",
  rightleftharpoons: "\u21CC",
  rightrightarrows: "\u21C9",
  rightsquigarrow: "\u219D",
  rightthreetimes: "\u22CC",
  ring: "\u02DA",
  risingdotseq: "\u2253",
  rlarr: "\u21C4",
  rlhar: "\u21CC",
  rlm: "\u200F",
  rmoust: "\u23B1",
  rmoustache: "\u23B1",
  rnmid: "\u2AEE",
  roang: "\u27ED",
  roarr: "\u21FE",
  robrk: "\u27E7",
  ropar: "\u2986",
  ropf: "\u{1D563}",
  roplus: "\u2A2E",
  rotimes: "\u2A35",
  rpar: ")",
  rpargt: "\u2994",
  rppolint: "\u2A12",
  rrarr: "\u21C9",
  rsaquo: "\u203A",
  rscr: "\u{1D4C7}",
  rsh: "\u21B1",
  rsqb: "]",
  rsquo: "\u2019",
  rsquor: "\u2019",
  rthree: "\u22CC",
  rtimes: "\u22CA",
  rtri: "\u25B9",
  rtrie: "\u22B5",
  rtrif: "\u25B8",
  rtriltri: "\u29CE",
  ruluhar: "\u2968",
  rx: "\u211E",
  sacute: "\u015B",
  sbquo: "\u201A",
  sc: "\u227B",
  scE: "\u2AB4",
  scap: "\u2AB8",
  scaron: "\u0161",
  sccue: "\u227D",
  sce: "\u2AB0",
  scedil: "\u015F",
  scirc: "\u015D",
  scnE: "\u2AB6",
  scnap: "\u2ABA",
  scnsim: "\u22E9",
  scpolint: "\u2A13",
  scsim: "\u227F",
  scy: "\u0441",
  sdot: "\u22C5",
  sdotb: "\u22A1",
  sdote: "\u2A66",
  seArr: "\u21D8",
  searhk: "\u2925",
  searr: "\u2198",
  searrow: "\u2198",
  sect: "\xA7",
  semi: ";",
  seswar: "\u2929",
  setminus: "\u2216",
  setmn: "\u2216",
  sext: "\u2736",
  sfr: "\u{1D530}",
  sfrown: "\u2322",
  sharp: "\u266F",
  shchcy: "\u0449",
  shcy: "\u0448",
  shortmid: "\u2223",
  shortparallel: "\u2225",
  shy: "\xAD",
  sigma: "\u03C3",
  sigmaf: "\u03C2",
  sigmav: "\u03C2",
  sim: "\u223C",
  simdot: "\u2A6A",
  sime: "\u2243",
  simeq: "\u2243",
  simg: "\u2A9E",
  simgE: "\u2AA0",
  siml: "\u2A9D",
  simlE: "\u2A9F",
  simne: "\u2246",
  simplus: "\u2A24",
  simrarr: "\u2972",
  slarr: "\u2190",
  smallsetminus: "\u2216",
  smashp: "\u2A33",
  smeparsl: "\u29E4",
  smid: "\u2223",
  smile: "\u2323",
  smt: "\u2AAA",
  smte: "\u2AAC",
  smtes: "\u2AAC\uFE00",
  softcy: "\u044C",
  sol: "/",
  solb: "\u29C4",
  solbar: "\u233F",
  sopf: "\u{1D564}",
  spades: "\u2660",
  spadesuit: "\u2660",
  spar: "\u2225",
  sqcap: "\u2293",
  sqcaps: "\u2293\uFE00",
  sqcup: "\u2294",
  sqcups: "\u2294\uFE00",
  sqsub: "\u228F",
  sqsube: "\u2291",
  sqsubset: "\u228F",
  sqsubseteq: "\u2291",
  sqsup: "\u2290",
  sqsupe: "\u2292",
  sqsupset: "\u2290",
  sqsupseteq: "\u2292",
  squ: "\u25A1",
  square: "\u25A1",
  squarf: "\u25AA",
  squf: "\u25AA",
  srarr: "\u2192",
  sscr: "\u{1D4C8}",
  ssetmn: "\u2216",
  ssmile: "\u2323",
  sstarf: "\u22C6",
  star: "\u2606",
  starf: "\u2605",
  straightepsilon: "\u03F5",
  straightphi: "\u03D5",
  strns: "\xAF",
  sub: "\u2282",
  subE: "\u2AC5",
  subdot: "\u2ABD",
  sube: "\u2286",
  subedot: "\u2AC3",
  submult: "\u2AC1",
  subnE: "\u2ACB",
  subne: "\u228A",
  subplus: "\u2ABF",
  subrarr: "\u2979",
  subset: "\u2282",
  subseteq: "\u2286",
  subseteqq: "\u2AC5",
  subsetneq: "\u228A",
  subsetneqq: "\u2ACB",
  subsim: "\u2AC7",
  subsub: "\u2AD5",
  subsup: "\u2AD3",
  succ: "\u227B",
  succapprox: "\u2AB8",
  succcurlyeq: "\u227D",
  succeq: "\u2AB0",
  succnapprox: "\u2ABA",
  succneqq: "\u2AB6",
  succnsim: "\u22E9",
  succsim: "\u227F",
  sum: "\u2211",
  sung: "\u266A",
  sup: "\u2283",
  sup1: "\xB9",
  sup2: "\xB2",
  sup3: "\xB3",
  supE: "\u2AC6",
  supdot: "\u2ABE",
  supdsub: "\u2AD8",
  supe: "\u2287",
  supedot: "\u2AC4",
  suphsol: "\u27C9",
  suphsub: "\u2AD7",
  suplarr: "\u297B",
  supmult: "\u2AC2",
  supnE: "\u2ACC",
  supne: "\u228B",
  supplus: "\u2AC0",
  supset: "\u2283",
  supseteq: "\u2287",
  supseteqq: "\u2AC6",
  supsetneq: "\u228B",
  supsetneqq: "\u2ACC",
  supsim: "\u2AC8",
  supsub: "\u2AD4",
  supsup: "\u2AD6",
  swArr: "\u21D9",
  swarhk: "\u2926",
  swarr: "\u2199",
  swarrow: "\u2199",
  swnwar: "\u292A",
  szlig: "\xDF",
  target: "\u2316",
  tau: "\u03C4",
  tbrk: "\u23B4",
  tcaron: "\u0165",
  tcedil: "\u0163",
  tcy: "\u0442",
  tdot: "\u20DB",
  telrec: "\u2315",
  tfr: "\u{1D531}",
  there4: "\u2234",
  therefore: "\u2234",
  theta: "\u03B8",
  thetasym: "\u03D1",
  thetav: "\u03D1",
  thickapprox: "\u2248",
  thicksim: "\u223C",
  thinsp: "\u2009",
  thkap: "\u2248",
  thksim: "\u223C",
  thorn: "\xFE",
  tilde: "\u02DC",
  times: "\xD7",
  timesb: "\u22A0",
  timesbar: "\u2A31",
  timesd: "\u2A30",
  tint: "\u222D",
  toea: "\u2928",
  top: "\u22A4",
  topbot: "\u2336",
  topcir: "\u2AF1",
  topf: "\u{1D565}",
  topfork: "\u2ADA",
  tosa: "\u2929",
  tprime: "\u2034",
  trade: "\u2122",
  triangle: "\u25B5",
  triangledown: "\u25BF",
  triangleleft: "\u25C3",
  trianglelefteq: "\u22B4",
  triangleq: "\u225C",
  triangleright: "\u25B9",
  trianglerighteq: "\u22B5",
  tridot: "\u25EC",
  trie: "\u225C",
  triminus: "\u2A3A",
  triplus: "\u2A39",
  trisb: "\u29CD",
  tritime: "\u2A3B",
  trpezium: "\u23E2",
  tscr: "\u{1D4C9}",
  tscy: "\u0446",
  tshcy: "\u045B",
  tstrok: "\u0167",
  twixt: "\u226C",
  twoheadleftarrow: "\u219E",
  twoheadrightarrow: "\u21A0",
  uArr: "\u21D1",
  uHar: "\u2963",
  uacute: "\xFA",
  uarr: "\u2191",
  ubrcy: "\u045E",
  ubreve: "\u016D",
  ucirc: "\xFB",
  ucy: "\u0443",
  udarr: "\u21C5",
  udblac: "\u0171",
  udhar: "\u296E",
  ufisht: "\u297E",
  ufr: "\u{1D532}",
  ugrave: "\xF9",
  uharl: "\u21BF",
  uharr: "\u21BE",
  uhblk: "\u2580",
  ulcorn: "\u231C",
  ulcorner: "\u231C",
  ulcrop: "\u230F",
  ultri: "\u25F8",
  umacr: "\u016B",
  uml: "\xA8",
  uogon: "\u0173",
  uopf: "\u{1D566}",
  uparrow: "\u2191",
  updownarrow: "\u2195",
  upharpoonleft: "\u21BF",
  upharpoonright: "\u21BE",
  uplus: "\u228E",
  upsi: "\u03C5",
  upsih: "\u03D2",
  upsilon: "\u03C5",
  upuparrows: "\u21C8",
  urcorn: "\u231D",
  urcorner: "\u231D",
  urcrop: "\u230E",
  uring: "\u016F",
  urtri: "\u25F9",
  uscr: "\u{1D4CA}",
  utdot: "\u22F0",
  utilde: "\u0169",
  utri: "\u25B5",
  utrif: "\u25B4",
  uuarr: "\u21C8",
  uuml: "\xFC",
  uwangle: "\u29A7",
  vArr: "\u21D5",
  vBar: "\u2AE8",
  vBarv: "\u2AE9",
  vDash: "\u22A8",
  vangrt: "\u299C",
  varepsilon: "\u03F5",
  varkappa: "\u03F0",
  varnothing: "\u2205",
  varphi: "\u03D5",
  varpi: "\u03D6",
  varpropto: "\u221D",
  varr: "\u2195",
  varrho: "\u03F1",
  varsigma: "\u03C2",
  varsubsetneq: "\u228A\uFE00",
  varsubsetneqq: "\u2ACB\uFE00",
  varsupsetneq: "\u228B\uFE00",
  varsupsetneqq: "\u2ACC\uFE00",
  vartheta: "\u03D1",
  vartriangleleft: "\u22B2",
  vartriangleright: "\u22B3",
  vcy: "\u0432",
  vdash: "\u22A2",
  vee: "\u2228",
  veebar: "\u22BB",
  veeeq: "\u225A",
  vellip: "\u22EE",
  verbar: "|",
  vert: "|",
  vfr: "\u{1D533}",
  vltri: "\u22B2",
  vnsub: "\u2282\u20D2",
  vnsup: "\u2283\u20D2",
  vopf: "\u{1D567}",
  vprop: "\u221D",
  vrtri: "\u22B3",
  vscr: "\u{1D4CB}",
  vsubnE: "\u2ACB\uFE00",
  vsubne: "\u228A\uFE00",
  vsupnE: "\u2ACC\uFE00",
  vsupne: "\u228B\uFE00",
  vzigzag: "\u299A",
  wcirc: "\u0175",
  wedbar: "\u2A5F",
  wedge: "\u2227",
  wedgeq: "\u2259",
  weierp: "\u2118",
  wfr: "\u{1D534}",
  wopf: "\u{1D568}",
  wp: "\u2118",
  wr: "\u2240",
  wreath: "\u2240",
  wscr: "\u{1D4CC}",
  xcap: "\u22C2",
  xcirc: "\u25EF",
  xcup: "\u22C3",
  xdtri: "\u25BD",
  xfr: "\u{1D535}",
  xhArr: "\u27FA",
  xharr: "\u27F7",
  xi: "\u03BE",
  xlArr: "\u27F8",
  xlarr: "\u27F5",
  xmap: "\u27FC",
  xnis: "\u22FB",
  xodot: "\u2A00",
  xopf: "\u{1D569}",
  xoplus: "\u2A01",
  xotime: "\u2A02",
  xrArr: "\u27F9",
  xrarr: "\u27F6",
  xscr: "\u{1D4CD}",
  xsqcup: "\u2A06",
  xuplus: "\u2A04",
  xutri: "\u25B3",
  xvee: "\u22C1",
  xwedge: "\u22C0",
  yacute: "\xFD",
  yacy: "\u044F",
  ycirc: "\u0177",
  ycy: "\u044B",
  yen: "\xA5",
  yfr: "\u{1D536}",
  yicy: "\u0457",
  yopf: "\u{1D56A}",
  yscr: "\u{1D4CE}",
  yucy: "\u044E",
  yuml: "\xFF",
  zacute: "\u017A",
  zcaron: "\u017E",
  zcy: "\u0437",
  zdot: "\u017C",
  zeetrf: "\u2128",
  zeta: "\u03B6",
  zfr: "\u{1D537}",
  zhcy: "\u0436",
  zigrarr: "\u21DD",
  zopf: "\u{1D56B}",
  zscr: "\u{1D4CF}",
  zwj: "\u200D",
  zwnj: "\u200C"
});

// node_modules/odf-kit/dist/html/normalize/rules/entities.js
var ENTITY_PATTERN = /&([a-zA-Z][a-zA-Z0-9]*);/g;
function decodeNamedEntities(html) {
  return html.replace(ENTITY_PATTERN, (match, name) => {
    const decoded = ENTITIES[name];
    return decoded !== void 0 ? decoded : match;
  });
}

// node_modules/odf-kit/dist/html/normalize/rules/raw-text.js
var RAW_TEXT_PATTERN = /<(script|style)(?=[\s>])([^>]*)>[\s\S]*?<\/\1\s*>/g;
function emptyRawTextElements(html) {
  return html.replace(RAW_TEXT_PATTERN, (_match, tag, attrs) => {
    return `<${tag}${attrs}></${tag}>`;
  });
}

// node_modules/odf-kit/dist/html/normalize/rules/doctype.js
var DOCTYPE_PATTERN = /<!DOCTYPE\b[^>]*>/i;
function lowercaseDoctype(html) {
  return html.replace(DOCTYPE_PATTERN, (match) => match.toLowerCase());
}

// node_modules/odf-kit/dist/html/normalize/rules/quote-unquoted-boolean-attrs.js
var TAG_PATTERN = /<([a-zA-Z][a-zA-Z0-9-]*)(?=[\s>])([^>]*)>/g;
function rewriteAttrArea(attrArea) {
  if (!attrArea.trim())
    return attrArea;
  let result = "";
  let i2 = 0;
  while (i2 < attrArea.length) {
    while (i2 < attrArea.length && /\s/.test(attrArea[i2])) {
      result += attrArea[i2];
      i2++;
    }
    if (i2 >= attrArea.length)
      break;
    const nameMatch = /^[a-zA-Z_:][a-zA-Z0-9_:.-]*/.exec(attrArea.slice(i2));
    if (!nameMatch) {
      result += attrArea[i2];
      i2++;
      continue;
    }
    const attrName = nameMatch[0];
    const afterName = i2 + attrName.length;
    let j = afterName;
    while (j < attrArea.length && /\s/.test(attrArea[j]))
      j++;
    if (j < attrArea.length && attrArea[j] === "=") {
      result += attrName;
      result += attrArea.slice(afterName, j);
      result += attrArea[j];
      j++;
      while (j < attrArea.length && /\s/.test(attrArea[j])) {
        result += attrArea[j];
        j++;
      }
      if (j < attrArea.length && (attrArea[j] === '"' || attrArea[j] === "'")) {
        const quote = attrArea[j];
        const end = attrArea.indexOf(quote, j + 1);
        if (end === -1) {
          result += attrArea.slice(j);
          i2 = attrArea.length;
          continue;
        }
        result += attrArea.slice(j, end + 1);
        i2 = end + 1;
      } else {
        let valEnd = j;
        while (valEnd < attrArea.length) {
          const ch = attrArea[valEnd];
          if (/\s/.test(ch))
            break;
          if (ch === "/" && attrArea[valEnd + 1] === ">")
            break;
          valEnd++;
        }
        result += attrArea.slice(j, valEnd);
        i2 = valEnd;
      }
    } else {
      result += `${attrName}=""`;
      i2 = afterName;
    }
  }
  return result;
}
function quoteUnquotedBooleanAttributes(html) {
  return html.replace(TAG_PATTERN, (_match, tagName, attrArea) => {
    const rewritten = rewriteAttrArea(attrArea ?? "");
    return `<${tagName}${rewritten}>`;
  });
}

// node_modules/odf-kit/dist/html/normalize/rules/quote-unquoted-attribute-values.js
var TAG_PATTERN2 = /<([a-zA-Z][a-zA-Z0-9-]*)(?=[\s>])([^>]*)>/g;
function rewriteAttrArea2(attrArea) {
  if (!attrArea.trim())
    return attrArea;
  if (!attrArea.includes("="))
    return attrArea;
  let result = "";
  let i2 = 0;
  while (i2 < attrArea.length) {
    while (i2 < attrArea.length && /\s/.test(attrArea[i2])) {
      result += attrArea[i2];
      i2++;
    }
    if (i2 >= attrArea.length)
      break;
    const nameMatch = /^[a-zA-Z_:][a-zA-Z0-9_:.-]*/.exec(attrArea.slice(i2));
    if (!nameMatch) {
      result += attrArea[i2];
      i2++;
      continue;
    }
    const attrName = nameMatch[0];
    const afterName = i2 + attrName.length;
    let j = afterName;
    while (j < attrArea.length && /\s/.test(attrArea[j]))
      j++;
    if (j >= attrArea.length || attrArea[j] !== "=") {
      result += attrName;
      result += attrArea.slice(afterName, j);
      i2 = j;
      continue;
    }
    result += attrName;
    result += attrArea.slice(afterName, j);
    result += "=";
    j++;
    const afterEq = j;
    while (j < attrArea.length && /\s/.test(attrArea[j]))
      j++;
    if (j >= attrArea.length) {
      result += attrArea.slice(afterEq);
      i2 = attrArea.length;
      continue;
    }
    result += attrArea.slice(afterEq, j);
    if (attrArea[j] === '"' || attrArea[j] === "'") {
      const quote = attrArea[j];
      const end = attrArea.indexOf(quote, j + 1);
      if (end === -1) {
        result += attrArea.slice(j);
        i2 = attrArea.length;
        continue;
      }
      result += attrArea.slice(j, end + 1);
      i2 = end + 1;
    } else {
      let valEnd = j;
      while (valEnd < attrArea.length) {
        const ch = attrArea[valEnd];
        if (/\s/.test(ch))
          break;
        if (ch === "/" && attrArea[valEnd + 1] === ">")
          break;
        valEnd++;
      }
      const value = attrArea.slice(j, valEnd);
      result += `"${value}"`;
      i2 = valEnd;
    }
  }
  return result;
}
function quoteUnquotedAttributeValues(html) {
  if (!html.includes("="))
    return html;
  return html.replace(TAG_PATTERN2, (_match, tagName, attrArea) => {
    const rewritten = rewriteAttrArea2(attrArea ?? "");
    return `<${tagName}${rewritten}>`;
  });
}

// node_modules/odf-kit/dist/html/normalize/rules/escape-attr-ampersands.js
var TAG_PATTERN3 = /<([a-zA-Z][a-zA-Z0-9-]*)(?=[\s>])([^>]*)>/g;
var ATTR_PATTERN = /([a-zA-Z_:][a-zA-Z0-9_:.-]*)=(?:"([^"]*)"|'([^']*)')/g;
var VALID_ENTITY = /&(?:amp|lt|gt|quot|apos|#[0-9]+|#x[0-9a-fA-F]+);/y;
function escapeValueAmpersands(value) {
  if (!value.includes("&"))
    return value;
  let result = "";
  let i2 = 0;
  while (i2 < value.length) {
    if (value[i2] !== "&") {
      result += value[i2];
      i2++;
      continue;
    }
    VALID_ENTITY.lastIndex = i2;
    if (VALID_ENTITY.test(value)) {
      result += value.slice(i2, VALID_ENTITY.lastIndex);
      i2 = VALID_ENTITY.lastIndex;
    } else {
      result += "&amp;";
      i2++;
    }
  }
  return result;
}
function rewriteAttrArea3(attrArea) {
  if (!attrArea.includes("&"))
    return attrArea;
  return attrArea.replace(ATTR_PATTERN, (match, attrName, doubleVal, singleVal) => {
    if (doubleVal !== void 0) {
      const fixed = escapeValueAmpersands(doubleVal);
      return `${attrName}="${fixed}"`;
    }
    if (singleVal !== void 0) {
      const fixed = escapeValueAmpersands(singleVal);
      return `${attrName}='${fixed}'`;
    }
    return match;
  });
}
function escapeAttributeValueAmpersands(html) {
  if (!html.includes("&"))
    return html;
  return html.replace(TAG_PATTERN3, (_match, tagName, attrArea) => {
    const rewritten = rewriteAttrArea3(attrArea ?? "");
    return `<${tagName}${rewritten}>`;
  });
}

// node_modules/odf-kit/dist/html/normalize/index.js
function odfKitNormalizer(html) {
  let s = html;
  s = emptyRawTextElements(s);
  s = lowercaseDoctype(s);
  s = quoteUnquotedBooleanAttributes(s);
  s = quoteUnquotedAttributeValues(s);
  s = selfCloseVoidElements(s);
  s = decodeNamedEntities(s);
  s = escapeAttributeValueAmpersands(s);
  return s;
}

// node_modules/odf-kit/dist/lexical/to-odt/util/detect-mime.js
var DATA_URL_MIME = {
  "data:image/png": "image/png",
  "data:image/jpeg": "image/jpeg",
  "data:image/jpg": "image/jpeg",
  "data:image/gif": "image/gif",
  "data:image/webp": "image/webp",
  "data:image/svg+xml": "image/svg+xml",
  "data:image/bmp": "image/bmp",
  "data:image/tiff": "image/tiff"
};
var EXT_MIME = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  bmp: "image/bmp",
  tiff: "image/tiff",
  tif: "image/tiff"
};
function detectMime(src, data) {
  for (const [prefix, mime] of Object.entries(DATA_URL_MIME)) {
    if (src.startsWith(prefix))
      return mime;
  }
  const extMatch = src.split("?")[0].split(".").pop()?.toLowerCase();
  if (extMatch && EXT_MIME[extMatch]) {
    return EXT_MIME[extMatch];
  }
  return detectMimeFromBytes(data);
}
function detectMimeFromBytes(data) {
  if (data.length < 4)
    return "image/png";
  if (data[0] === 137 && data[1] === 80 && data[2] === 78 && data[3] === 71) {
    return "image/png";
  }
  if (data[0] === 255 && data[1] === 216 && data[2] === 255) {
    return "image/jpeg";
  }
  if (data[0] === 71 && data[1] === 73 && data[2] === 70 && data[3] === 56) {
    return "image/gif";
  }
  if (data[0] === 82 && data[1] === 73 && data[2] === 70 && data[3] === 70 && data.length >= 12 && data[8] === 87 && data[9] === 69 && data[10] === 66 && data[11] === 80) {
    return "image/webp";
  }
  if (data[0] === 66 && data[1] === 77) {
    return "image/bmp";
  }
  if (data[0] === 60) {
    return "image/svg+xml";
  }
  return "image/png";
}
function isBase64Image(src) {
  return src.startsWith("data:");
}
function base64ToUint8Array(src) {
  const base64 = src.includes(",") ? src.split(",")[1] : src;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i2 = 0; i2 < binary.length; i2++) {
    bytes[i2] = binary.charCodeAt(i2);
  }
  return bytes;
}

// node_modules/odf-kit/dist/html/to-odt/html-parser.js
init_length();
var HR_BORDER = "0.5pt solid #000000";
var BLOCKQUOTE_INDENT = "1cm";
var MONOSPACE_FONT = "Courier New";
var DEFAULT_IMAGE_WIDTH = "10cm";
var BLOCK_TAGS = /* @__PURE__ */ new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "div",
  "section",
  "article",
  "main",
  "header",
  "footer",
  "nav",
  "aside",
  "ul",
  "ol",
  "li",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "td",
  "th",
  "blockquote",
  "pre",
  "hr",
  "figure",
  "figcaption",
  "html",
  "body",
  "head",
  "script",
  "style",
  "img"
]);
var LIST_TAGS = /* @__PURE__ */ new Set(["ul", "ol"]);
async function parseHtml(html, doc, images, fetchImage, hooks) {
  const ctx = { images, fetchImage };
  const normalizer = hooks?.normalizer === false ? null : hooks?.normalizer ?? odfKitNormalizer;
  const parser = hooks?.parser ?? odfKitParser;
  const wrapped = `<div>${html}</div>`;
  const normalized = normalizer ? normalizer(wrapped) : wrapped;
  const root = parser(normalized);
  await walkBlockChildren(root.children, doc, ctx);
}
function normalizeTag(tag) {
  return tag.toLowerCase().replace(/^[^:]+:/, "");
}
function isBlockTag(tag) {
  return BLOCK_TAGS.has(tag);
}
async function resolveImage(src, ctx) {
  if (!src)
    return void 0;
  let data;
  if (isBase64Image(src)) {
    data = base64ToUint8Array(src);
  } else if (ctx.images?.[src]) {
    data = ctx.images[src];
  } else if (ctx.fetchImage) {
    data = await ctx.fetchImage(src);
  }
  if (!data || data.length === 0)
    return void 0;
  return { data, mimeType: detectMime(src, data) };
}
function parseImageDimensions(node) {
  const parseAttr = (attr) => {
    const raw = node.attrs[attr];
    if (!raw)
      return void 0;
    const trimmed = raw.trim();
    if (/^[\d.]+\s*(cm|mm|in|pt|pc|em|rem)$/.test(trimmed))
      return trimmed;
    const px = parseFloat(trimmed);
    if (!px || px <= 0)
      return void 0;
    const cm = px / 96 * 2.54;
    return `${cm.toFixed(2)}cm`;
  };
  return { width: parseAttr("width"), height: parseAttr("height") };
}
async function walkBlockChildren(nodes, doc, ctx, defaultParaOpts) {
  const pendingInlines = [];
  async function flushPending() {
    if (pendingInlines.length === 0)
      return;
    const runs = await extractInline(pendingInlines, {}, ctx);
    const meaningful = runs.some((r) => r.text && r.text.trim().length > 0 || r.lineBreak || r.image != null);
    if (meaningful) {
      doc.addParagraph((p) => applyRunsToBuilder(p, runs), defaultParaOpts);
    }
    pendingInlines.length = 0;
  }
  for (const node of nodes) {
    if (node.type === "text") {
      if (node.text.trim().length > 0) {
        pendingInlines.push(node);
      }
      continue;
    }
    const tag = normalizeTag(node.tag);
    if (isBlockTag(tag)) {
      await flushPending();
      await walkBlockElement(node, doc, ctx, defaultParaOpts);
    } else {
      pendingInlines.push(node);
    }
  }
  await flushPending();
}
async function walkBlockElement(node, doc, ctx, defaultParaOpts) {
  const tag = normalizeTag(node.tag);
  switch (tag) {
    // ── Headings ───────────────────────────────────────────────────
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6": {
      const level = parseInt(tag[1], 10);
      const runs = await extractInline(node.children, {}, ctx);
      const headingOpts = mergeParagraphOptions(defaultParaOpts, parseParagraphOptions(node));
      doc.addHeading((p) => applyRunsToBuilder(p, runs), level, headingOpts);
      break;
    }
    // ── Paragraph ──────────────────────────────────────────────────
    case "p": {
      const runs = await extractInline(node.children, {}, ctx);
      const opts = mergeParagraphOptions(defaultParaOpts, parseParagraphOptions(node));
      doc.addParagraph((p) => applyRunsToBuilder(p, runs), opts);
      break;
    }
    // ── Blockquote ─────────────────────────────────────────────────
    case "blockquote": {
      await walkBlockChildren(node.children, doc, ctx, mergeParagraphOptions(defaultParaOpts, { indentLeft: BLOCKQUOTE_INDENT }) ?? {
        indentLeft: BLOCKQUOTE_INDENT
      });
      break;
    }
    // ── Preformatted ───────────────────────────────────────────────
    case "pre": {
      const text = extractTextContent(node).replace(/^\n/, "").replace(/\n$/, "");
      const lines = text.split("\n");
      doc.addParagraph((p) => {
        lines.forEach((line, i2) => {
          p.addText(line, { fontFamily: MONOSPACE_FONT });
          if (i2 < lines.length - 1)
            p.addLineBreak();
        });
      });
      break;
    }
    // ── Horizontal rule ───────────────────────────────────────────
    case "hr": {
      doc.addParagraph("", { borderBottom: HR_BORDER });
      break;
    }
    // ── Lists ──────────────────────────────────────────────────────
    case "ul": {
      await walkList(node, doc, ctx, false);
      break;
    }
    case "ol": {
      await walkList(node, doc, ctx, true);
      break;
    }
    // ── Table ─────────────────────────────────────────────────────
    case "table": {
      await walkTable(node, doc, ctx);
      break;
    }
    // ── Standalone image ──────────────────────────────────────────
    case "img": {
      const src = node.attrs["src"] ?? "";
      const resolved = await resolveImage(src, ctx);
      if (resolved) {
        const { width, height } = parseImageDimensions(node);
        const alt = node.attrs["alt"];
        doc.addImage(resolved.data, {
          mimeType: resolved.mimeType,
          width: width ?? DEFAULT_IMAGE_WIDTH,
          height,
          ...alt ? { alt } : {}
        });
      }
      break;
    }
    // ── Figure ────────────────────────────────────────────────────
    case "figure": {
      for (const child of node.children) {
        if (child.type !== "element")
          continue;
        const childTag = normalizeTag(child.tag);
        if (childTag === "img") {
          const src = child.attrs["src"] ?? "";
          const resolved = await resolveImage(src, ctx);
          if (resolved) {
            const { width, height } = parseImageDimensions(child);
            const alt = child.attrs["alt"];
            doc.addImage(resolved.data, {
              mimeType: resolved.mimeType,
              width: width ?? DEFAULT_IMAGE_WIDTH,
              height,
              ...alt ? { alt } : {}
            });
          }
        } else if (childTag === "figcaption") {
          const runs = await extractInline(child.children, {}, ctx);
          doc.addParagraph((p) => applyRunsToBuilder(p, runs));
        }
      }
      break;
    }
    // ── Transparent block containers ──────────────────────────────
    case "div":
    case "section":
    case "article":
    case "main":
    case "header":
    case "footer":
    case "nav":
    case "aside":
    case "body":
    case "html": {
      await walkBlockChildren(node.children, doc, ctx, defaultParaOpts);
      break;
    }
    // ── Ignored ───────────────────────────────────────────────────
    case "head":
    case "script":
    case "style":
    case "meta":
    case "link":
      break;
    // ── Unknown block — recurse as transparent container ──────────
    default:
      await walkBlockChildren(node.children, doc, ctx, defaultParaOpts);
      break;
  }
}
async function walkList(node, doc, ctx, ordered) {
  const items = await extractListItems(node, ctx);
  doc.addList((l) => applyListItems(l, items), { type: ordered ? "numbered" : "bullet" });
}
async function extractListItems(listNode, ctx) {
  const items = [];
  for (const child of listNode.children) {
    if (child.type !== "element")
      continue;
    if (normalizeTag(child.tag) !== "li")
      continue;
    const inlineChildren = child.children.filter((c) => {
      if (c.type === "text")
        return true;
      return !LIST_TAGS.has(normalizeTag(c.tag));
    });
    const nestedListChild = child.children.find((c) => c.type === "element" && LIST_TAGS.has(normalizeTag(c.tag)));
    const runs = await extractInline(inlineChildren, {}, ctx);
    const item = { runs };
    if (nestedListChild) {
      const nestedTag = normalizeTag(nestedListChild.tag);
      item.nested = await extractListItems(nestedListChild, ctx);
      item.nestedOrdered = nestedTag === "ol";
    }
    items.push(item);
  }
  return items;
}
function applyListItems(l, items) {
  for (const item of items) {
    if (item.runs.length > 0 && item.runs.some((r) => r.text || r.lineBreak)) {
      l.addItem((p) => applyRunsToBuilder(p, item.runs));
    } else {
      l.addItem("");
    }
    if (item.nested) {
      l.addNested((sub2) => applyListItems(sub2, item.nested));
    }
  }
}
async function walkTable(node, doc, ctx) {
  const rows = collectTableRows(node);
  if (rows.length === 0)
    return;
  const cellData = await Promise.all(rows.map((row) => Promise.all(row.map((cell) => extractCellContent(cell, ctx)))));
  doc.addTable((t) => {
    for (const row of cellData) {
      t.addRow((r) => {
        for (const { runs, options } of row) {
          r.addCell((c) => applyRunsToBuilder(c, runs), options);
        }
      });
    }
  });
}
function collectTableRows(tableNode) {
  const rows = [];
  function processContainer(el2) {
    for (const child of el2.children) {
      if (child.type !== "element")
        continue;
      const tag = normalizeTag(child.tag);
      if (tag === "tr") {
        const cells = child.children.filter((c) => c.type === "element" && (normalizeTag(c.tag) === "td" || normalizeTag(c.tag) === "th"));
        if (cells.length > 0)
          rows.push(cells);
      } else if (tag === "thead" || tag === "tbody" || tag === "tfoot" || tag === "table") {
        processContainer(child);
      }
    }
  }
  processContainer(tableNode);
  return rows;
}
async function extractCellContent(cell, ctx) {
  const isHeader = normalizeTag(cell.tag) === "th";
  const style = cell.attrs["style"] ?? "";
  const options = {};
  const bg = extractCssProperty(style, "background-color");
  if (bg)
    options.backgroundColor = bg;
  const border = extractCssProperty(style, "border");
  if (border)
    options.border = border;
  const baseFormatting = isHeader ? { bold: true } : {};
  const runs = await extractInline(cell.children, baseFormatting, ctx);
  return { runs, options };
}
async function extractInline(nodes, inherited, ctx) {
  const runs = [];
  for (const node of nodes) {
    if (node.type === "text") {
      const text = normalizeWhitespace(node.text);
      if (text) {
        runs.push(makeRun(text, inherited));
      }
      continue;
    }
    const tag = normalizeTag(node.tag);
    switch (tag) {
      case "strong":
      case "b":
        runs.push(...await extractInline(node.children, { ...inherited, bold: true }, ctx));
        break;
      case "em":
      case "i":
        runs.push(...await extractInline(node.children, { ...inherited, italic: true }, ctx));
        break;
      case "u":
        runs.push(...await extractInline(node.children, { ...inherited, underline: true }, ctx));
        break;
      case "s":
      case "del":
        runs.push(...await extractInline(node.children, { ...inherited, strikethrough: true }, ctx));
        break;
      case "sup":
        runs.push(...await extractInline(node.children, { ...inherited, superscript: true }, ctx));
        break;
      case "sub":
        runs.push(...await extractInline(node.children, { ...inherited, subscript: true }, ctx));
        break;
      case "code":
        runs.push(...await extractInline(node.children, { ...inherited, fontFamily: MONOSPACE_FONT }, ctx));
        break;
      case "mark":
        runs.push(...await extractInline(node.children, { ...inherited, highlightColor: "yellow" }, ctx));
        break;
      case "span": {
        const spanFormatting = mergeInlineStyle(node.attrs["style"] ?? "", inherited);
        runs.push(...await extractInline(node.children, spanFormatting, ctx));
        break;
      }
      case "a": {
        const href = node.attrs["href"] ?? "";
        const linkRuns = await extractInline(node.children, inherited, ctx);
        for (const r of linkRuns) {
          runs.push({ ...r, link: href });
        }
        break;
      }
      case "br":
        runs.push({ text: "", lineBreak: true });
        break;
      case "img": {
        const src = node.attrs["src"] ?? "";
        const resolved = await resolveImage(src, ctx);
        if (resolved) {
          const { width, height } = parseImageDimensions(node);
          const alt = node.attrs["alt"];
          runs.push({
            text: "",
            image: {
              data: resolved.data,
              mimeType: resolved.mimeType,
              width: width ?? DEFAULT_IMAGE_WIDTH,
              height,
              anchor: "as-character",
              ...alt ? { alt } : {}
            }
          });
        }
        break;
      }
      // Ignored elements — no content
      case "script":
      case "style":
        break;
      // Everything else (including block tags in inline context) — recurse transparently
      default:
        runs.push(...await extractInline(node.children, inherited, ctx));
        break;
    }
  }
  return runs;
}
function makeRun(text, formatting) {
  const hasFormatting = Object.keys(formatting).length > 0;
  return hasFormatting ? { text, formatting } : { text };
}
function mergeInlineStyle(style, inherited) {
  if (!style.trim())
    return inherited;
  const result = { ...inherited };
  for (const decl of style.split(";")) {
    const colon = decl.indexOf(":");
    if (colon === -1)
      continue;
    const prop = decl.slice(0, colon).trim().toLowerCase();
    const value = decl.slice(colon + 1).trim();
    if (!value)
      continue;
    switch (prop) {
      case "color":
        result.color = value;
        break;
      case "font-size":
        result.fontSize = convertFontSize(value);
        break;
      case "font-family": {
        const family = value.split(",")[0].trim().replace(/^['"]|['"]$/g, "");
        if (family)
          result.fontFamily = family;
        break;
      }
      case "font-weight":
        if (value === "bold" || parseInt(value, 10) >= 600 && !isNaN(parseInt(value, 10))) {
          result.bold = true;
        }
        break;
      case "font-style":
        if (value === "italic" || value === "oblique")
          result.italic = true;
        break;
      case "text-decoration":
        if (value.includes("underline"))
          result.underline = true;
        if (value.includes("line-through"))
          result.strikethrough = true;
        break;
    }
  }
  return result;
}
function convertFontSize(value) {
  if (value.endsWith("px")) {
    const px = parseFloat(value);
    return `${Math.round(px * 0.75)}pt`;
  }
  if (value.endsWith("em")) {
    const em = parseFloat(value);
    return `${Math.round(em * 12)}pt`;
  }
  return value;
}
function extractCssProperty(style, property) {
  for (const decl of style.split(";")) {
    const colon = decl.indexOf(":");
    if (colon === -1)
      continue;
    const prop = decl.slice(0, colon).trim().toLowerCase();
    if (prop === property) {
      const value = decl.slice(colon + 1).trim();
      return value || void 0;
    }
  }
  return void 0;
}
function cssLengthToOdf(raw) {
  const value = raw.trim().toLowerCase();
  const px = /^([-+]?(?:\d+(?:\.\d*)?|\.\d+))px$/.exec(value);
  if (px) {
    if (px[1].startsWith("-"))
      return void 0;
    if (!parseOdfValue(value))
      return void 0;
    const dot = px[1].indexOf(".");
    if (dot >= 0 && px[1].length - dot - 1 >= MAX_EMISSION_SEARCH_K)
      return void 0;
    return convertDecimal(px[1], "px", "pt");
  }
  const parsed = parseOdfValue(value);
  if (!parsed || parsed.kind !== "length")
    return void 0;
  if (parsed.lexical !== void 0 && parsed.lexical.startsWith("-"))
    return void 0;
  return parsed.lexical;
}
function parseCssLineHeight(raw) {
  const value = raw.trim().toLowerCase();
  if (value === "normal")
    return void 0;
  if (/^\d+(?:\.\d*)?$|^\.\d+$/.test(value))
    return Number(value);
  const parsed = parseOdfValue(value);
  if (parsed?.kind === "percent") {
    return parsed.lexical.startsWith("-") ? void 0 : parsed.lexical;
  }
  return cssLengthToOdf(value);
}
function parseParagraphOptions(node) {
  const style = node.attrs["style"] ?? "";
  const opts = {};
  const align = (extractCssProperty(style, "text-align") ?? node.attrs["align"] ?? "").trim().toLowerCase();
  if (align === "left" || align === "center" || align === "right" || align === "justify" || align === "start" || align === "end") {
    opts.align = align;
  }
  const direction = (extractCssProperty(style, "direction") ?? node.attrs["dir"] ?? "").trim().toLowerCase();
  if (direction === "rtl")
    opts.writingMode = "rl-tb";
  else if (direction === "ltr")
    opts.writingMode = "lr-tb";
  const marginTop = extractCssProperty(style, "margin-top");
  if (marginTop !== void 0) {
    const v = cssLengthToOdf(marginTop);
    if (v !== void 0)
      opts.spaceBefore = v;
  }
  const marginBottom = extractCssProperty(style, "margin-bottom");
  if (marginBottom !== void 0) {
    const v = cssLengthToOdf(marginBottom);
    if (v !== void 0)
      opts.spaceAfter = v;
  }
  const lineHeight = extractCssProperty(style, "line-height");
  if (lineHeight !== void 0) {
    const v = parseCssLineHeight(lineHeight);
    if (v !== void 0)
      opts.lineHeight = v;
  }
  return Object.keys(opts).length > 0 ? opts : void 0;
}
function mergeParagraphOptions(base, override) {
  if (!base && !override)
    return void 0;
  if (!base)
    return override;
  if (!override)
    return base;
  return { ...base, ...override };
}
function extractTextContent(node) {
  let text = "";
  for (const child of node.children) {
    if (child.type === "text") {
      text += child.text;
    } else {
      text += extractTextContent(child);
    }
  }
  return text;
}
function normalizeWhitespace(text) {
  return text.replace(/\s+/g, " ");
}
function applyRunsToBuilder(p, runs) {
  for (const run of runs) {
    if (run.lineBreak) {
      p.addLineBreak();
    } else if (run.image) {
      p.addImage(run.image.data, {
        mimeType: run.image.mimeType,
        width: run.image.width,
        height: run.image.height,
        ...run.image.alt ? { alt: run.image.alt } : {}
      });
    } else if (run.link !== void 0) {
      p.addLink(run.text, run.link, run.formatting);
    } else if (run.text) {
      p.addText(run.text, run.formatting);
    }
  }
}

// node_modules/odf-kit/dist/html/to-odt/html-to-odt.js
var PAGE_FORMATS = {
  A4: { width: "21cm", height: "29.7cm", margin: "2.5cm" },
  letter: { width: "21.59cm", height: "27.94cm", margin: "2.54cm" },
  legal: { width: "21.59cm", height: "35.56cm", margin: "2.54cm" },
  A3: { width: "29.7cm", height: "42cm", margin: "2.5cm" },
  A5: { width: "14.8cm", height: "21cm", margin: "2cm" }
};
async function htmlToOdt(html, options) {
  const doc = new OdtDocument();
  if (options?.metadata) {
    doc.setMetadata(options.metadata);
  }
  const format = PAGE_FORMATS[options?.pageFormat ?? "A4"];
  const layout = {
    width: options?.pageWidth ?? format.width,
    height: options?.pageHeight ?? format.height,
    orientation: options?.orientation,
    marginTop: options?.marginTop ?? format.margin,
    marginBottom: options?.marginBottom ?? format.margin,
    marginLeft: options?.marginLeft ?? format.margin,
    marginRight: options?.marginRight ?? format.margin
  };
  doc.setPageLayout(layout);
  await parseHtml(html, doc, options?.images, options?.fetchImage, {
    normalizer: options?.normalizer,
    parser: options?.parser
  });
  return doc.save();
}
export {
  htmlToOdt
};
