// node_modules/fflate/esm/browser.js
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([
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
var fdeb = new u8([
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
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
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
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x = (i & 43690) >> 1 | (i & 21845) << 1;
  x = (x & 52428) >> 2 | (x & 13107) << 2;
  x = (x & 61680) >> 4 | (x & 3855) << 4;
  rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
}
var x;
var i;
var hMap = (function(cd, mb, r) {
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
var flt = new u8(288);
for (i = 0; i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144; i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256; i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280; i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i)
  fdt[i] = 5;
var i;
var flm = /* @__PURE__ */ hMap(flt, 9, 0);
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = function(a) {
  var m = a[0];
  for (var i2 = 1; i2 < a.length; ++i2) {
    if (a[i2] > m)
      m = a[i2];
  }
  return m;
};
var bits = function(d, p, m) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
};
var bits16 = function(d, p) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
};
var shft = function(p) {
  return (p + 7) / 8 | 0;
};
var slc = function(v, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  return new u8(v.subarray(s, e));
};
var ec = [
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
var err = function(ind, msg, nt) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt)
    throw e;
  return e;
};
var inflt = function(dat, st, buf, dict) {
  var sl = dat.length, dl = dict ? dict.length : 0;
  if (!sl || st.f && !st.l)
    return buf || new u8(0);
  var noBuf = !buf;
  var resize = noBuf || st.i != 2;
  var noSt = st.i;
  if (noBuf)
    buf = new u8(sl * 3);
  var cbuf = function(l2) {
    var bl = buf.length;
    if (l2 > bl) {
      var nbuf = new u8(Math.max(bl * 2, l2));
      nbuf.set(buf);
      buf = nbuf;
    }
  };
  var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
  var tbts = sl * 8;
  do {
    if (!lm) {
      final = bits(dat, pos, 1);
      var type = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type) {
        var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
        if (t > sl) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + l);
        buf.set(dat.subarray(s, t), bt);
        st.b = bt += l, st.p = pos = t * 8, st.f = final;
        continue;
      } else if (type == 1)
        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u8(tl);
        var clt = new u8(19);
        for (var i2 = 0; i2 < hcLen; ++i2) {
          clt[clim[i2]] = bits(dat, pos + i2 * 3, 7);
        }
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        var clm = hMap(clt, clb, 1);
        for (var i2 = 0; i2 < tl; ) {
          var r = clm[bits(dat, pos, clbmsk)];
          pos += r & 15;
          var s = r >> 4;
          if (s < 16) {
            ldt[i2++] = s;
          } else {
            var c = 0, n = 0;
            if (s == 16)
              n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i2 - 1];
            else if (s == 17)
              n = 3 + bits(dat, pos, 7), pos += 3;
            else if (s == 18)
              n = 11 + bits(dat, pos, 127), pos += 7;
            while (n--)
              ldt[i2++] = c;
          }
        }
        var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
        lbt = max(lt);
        dbt = max(dt);
        lm = hMap(lt, lbt, 1);
        dm = hMap(dt, dbt, 1);
      } else
        err(1);
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
    }
    if (resize)
      cbuf(bt + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var lpos = pos;
    for (; ; lpos = pos) {
      var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
      pos += c & 15;
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
      if (!c)
        err(2);
      if (sym < 256)
        buf[bt++] = sym;
      else if (sym == 256) {
        lpos = pos, lm = null;
        break;
      } else {
        var add = sym - 254;
        if (sym > 264) {
          var i2 = sym - 257, b = fleb[i2];
          add = bits(dat, pos, (1 << b) - 1) + fl[i2];
          pos += b;
        }
        var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
        if (!d)
          err(3);
        pos += d & 15;
        var dt = fd[dsym];
        if (dsym > 3) {
          var b = fdeb[dsym];
          dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
        }
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + 131072);
        var end = bt + add;
        if (bt < dt) {
          var shift = dl - dt, dend = Math.min(dt, end);
          if (shift + bt < 0)
            err(3);
          for (; bt < dend; ++bt)
            buf[bt] = dict[shift + bt];
        }
        for (; bt < end; ++bt)
          buf[bt] = buf[bt - dt];
      }
    }
    st.l = lm, st.p = lpos, st.b = bt, st.f = final;
    if (lm)
      final = 1, st.m = lbt, st.d = dm, st.n = dbt;
  } while (!final);
  return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
};
var wbits = function(d, p, v) {
  v <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v;
  d[o + 1] |= v >> 8;
};
var wbits16 = function(d, p, v) {
  v <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v;
  d[o + 1] |= v >> 8;
  d[o + 2] |= v >> 16;
};
var hTree = function(d, mb) {
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
var ln = function(n, l, d) {
  return n.s == -1 ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1)) : l[n.s] = d;
};
var lc = function(c) {
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
var clen = function(cf, cl) {
  var l = 0;
  for (var i2 = 0; i2 < cl.length; ++i2)
    l += cf[i2] * cl[i2];
  return l;
};
var wfblk = function(out, pos, dat) {
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
var wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
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
var deo = /* @__PURE__ */ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
var et = /* @__PURE__ */ new u8(0);
var dflt = function(dat, lvl, plvl, pre, post, st) {
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
var crct = /* @__PURE__ */ (function() {
  var t = new Int32Array(256);
  for (var i2 = 0; i2 < 256; ++i2) {
    var c = i2, k = 9;
    while (--k)
      c = (c & 1 && -306674912) ^ c >>> 1;
    t[i2] = c;
  }
  return t;
})();
var crc = function() {
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
var dopt = function(dat, opt, pre, post, st) {
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
var mrg = function(a, b) {
  var o = {};
  for (var k in a)
    o[k] = a[k];
  for (var k in b)
    o[k] = b[k];
  return o;
};
var b2 = function(d, b) {
  return d[b] | d[b + 1] << 8;
};
var b4 = function(d, b) {
  return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
};
var b8 = function(d, b) {
  return b4(d, b) + b4(d, b + 4) * 4294967296;
};
var wbytes = function(d, b, v) {
  for (; v; ++b)
    d[b] = v, v >>>= 8;
};
function deflateSync(data, opts) {
  return dopt(data, opts || {}, 0, 0);
}
function inflateSync(data, opts) {
  return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
}
var fltn = function(d, p, t, o) {
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
var te = typeof TextEncoder != "undefined" && /* @__PURE__ */ new TextEncoder();
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e) {
}
var dutf8 = function(d) {
  for (var r = "", i2 = 0; ; ) {
    var c = d[i2++];
    var eb = (c > 127) + (c > 223) + (c > 239);
    if (i2 + eb > d.length)
      return { s: r, r: slc(d, i2 - 1) };
    if (!eb)
      r += String.fromCharCode(c);
    else if (eb == 3) {
      c = ((c & 15) << 18 | (d[i2++] & 63) << 12 | (d[i2++] & 63) << 6 | d[i2++] & 63) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
    } else if (eb & 1)
      r += String.fromCharCode((c & 31) << 6 | d[i2++] & 63);
    else
      r += String.fromCharCode((c & 15) << 12 | (d[i2++] & 63) << 6 | d[i2++] & 63);
  }
};
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
function strFromU8(dat, latin1) {
  if (latin1) {
    var r = "";
    for (var i2 = 0; i2 < dat.length; i2 += 16384)
      r += String.fromCharCode.apply(null, dat.subarray(i2, i2 + 16384));
    return r;
  } else if (td) {
    return td.decode(dat);
  } else {
    var _a2 = dutf8(dat), s = _a2.s, r = _a2.r;
    if (r.length)
      err(8);
    return s;
  }
}
var slzh = function(d, b) {
  return b + 30 + b2(d, b + 26) + b2(d, b + 28);
};
var zh = function(d, b, z) {
  var fnl = b2(d, b + 28), efl = b2(d, b + 30), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(b2(d, b + 8) & 2048)), es = b + 46 + fnl;
  var _a2 = z64hs(d, es, efl, z, b4(d, b + 20), b4(d, b + 24), b4(d, b + 42)), sc = _a2[0], su = _a2[1], off = _a2[2];
  return [b2(d, b + 10), sc, su, fn, es + efl + b2(d, b + 32), off];
};
var z64hs = function(d, b, l, z, sc, su, off) {
  var nsc = sc == 4294967295, nsu = su == 4294967295, noff = off == 4294967295, e = b + l;
  var nf = nsc + nsu + noff;
  if (z && nf) {
    for (; b + 4 < e; b += 4 + b2(d, b + 2)) {
      if (b2(d, b) == 1) {
        return [
          nsc ? b8(d, b + 4 + 8 * nsu) : sc,
          nsu ? b8(d, b + 4) : su,
          noff ? b8(d, b + 4 + 8 * (nsu + nsc)) : off,
          1
        ];
      }
    }
    if (z < 2)
      err(13);
  }
  return [sc, su, off, 0];
};
var exfl = function(ex) {
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
var wzh = function(d, b, f, fn, u, c, ce, co) {
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
var wzf = function(o, b, c, d, e) {
  wbytes(o, b, 101010256);
  wbytes(o, b + 8, c);
  wbytes(o, b + 10, c);
  wbytes(o, b + 12, d);
  wbytes(o, b + 16, e);
};
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
function unzipSync(data, opts) {
  var files = {};
  var e = data.length - 22;
  for (; b4(data, e) != 101010256; --e) {
    if (!e || data.length - e > 65558)
      err(13);
  }
  ;
  var c = b2(data, e + 8);
  if (!c)
    return {};
  var o = b4(data, e + 16);
  var z = b4(data, e - 20) == 117853008;
  if (z) {
    var ze = b4(data, e - 12);
    z = b4(data, ze) == 101075792;
    if (z) {
      c = b4(data, ze + 32);
      o = b4(data, ze + 48);
    }
  }
  var fltr = opts && opts.filter;
  for (var i2 = 0; i2 < c; ++i2) {
    var _a2 = zh(data, o, z), c_2 = _a2[0], sc = _a2[1], su = _a2[2], fn = _a2[3], no = _a2[4], off = _a2[5], b = slzh(data, off);
    o = no;
    if (!fltr || fltr({
      name: fn,
      size: sc,
      originalSize: su,
      compression: c_2
    })) {
      if (!c_2)
        files[fn] = slc(data, b, b + sc);
      else if (c_2 == 8)
        files[fn] = inflateSync(data.subarray(b, b + sc), { out: new u8(su) });
      else
        err(14, "unknown compression type " + c_2);
    }
  }
  return files;
}

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

// node_modules/odf-kit/dist/docx/to-odt/relationships.js
function parseRelationships(xml) {
  const map = /* @__PURE__ */ new Map();
  const root = parseXml(xml);
  for (const child of root.children) {
    if (child.type !== "element")
      continue;
    if (localName(child.tag) !== "Relationship")
      continue;
    const id = child.attrs["Id"];
    const type = child.attrs["Type"] ?? "";
    const rawTarget = child.attrs["Target"] ?? "";
    const targetMode = child.attrs["TargetMode"] ?? "";
    if (!id)
      continue;
    const external = targetMode === "External";
    const target = external ? rawTarget : resolveTarget(rawTarget);
    const entry = { target, external, type };
    map.set(id, entry);
  }
  return map;
}
function resolveTarget(rawTarget) {
  if (rawTarget.startsWith("/") || /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(rawTarget)) {
    return rawTarget;
  }
  const base = "word/";
  const parts = (base + rawTarget).split("/");
  const resolved = [];
  for (const part of parts) {
    if (part === "..") {
      resolved.pop();
    } else if (part !== ".") {
      resolved.push(part);
    }
  }
  return resolved.join("/");
}
function localName(tag) {
  const colon = tag.indexOf(":");
  return colon === -1 ? tag : tag.slice(colon + 1);
}

// node_modules/odf-kit/dist/docx/to-odt/types.js
var DEFAULT_RUN_PROPS = {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  doubleStrikethrough: false,
  superscript: false,
  subscript: false,
  smallCaps: false,
  allCaps: false,
  color: null,
  fontSize: null,
  highlight: null,
  fontFamily: null,
  lang: null,
  rStyleId: null
};
var DEFAULT_PARA_PROPS = {
  alignment: null,
  pageBreakBefore: false,
  spaceBefore: null,
  spaceAfter: null,
  lineHeight: null,
  indentLeft: null,
  indentRight: null,
  indentFirstLine: null,
  list: null,
  borderBottom: null
};

// node_modules/odf-kit/dist/docx/to-odt/styles.js
function parseStyles(xml) {
  const map = /* @__PURE__ */ new Map();
  const root = parseXml(xml);
  for (const child of root.children) {
    if (child.type !== "element")
      continue;
    if (localName2(child.tag) !== "style")
      continue;
    const entry = parseStyleEntry(child);
    if (entry)
      map.set(entry.styleId, entry);
  }
  return map;
}
function parseStyleEntry(el2) {
  const styleId = el2.attrs["w:styleId"];
  if (!styleId)
    return null;
  const rawType = el2.attrs["w:type"] ?? "paragraph";
  const type = normalizeStyleType(rawType);
  let name = "";
  let basedOn = null;
  let rPr = null;
  let pPr = null;
  let outlineLvl = null;
  for (const child of el2.children) {
    if (child.type !== "element")
      continue;
    const tag = localName2(child.tag);
    switch (tag) {
      case "name":
        name = child.attrs["w:val"] ?? "";
        break;
      case "basedOn":
        basedOn = child.attrs["w:val"] ?? null;
        break;
      case "rPr":
        rPr = parseRPr(child);
        break;
      case "pPr": {
        const result = parsePPr(child);
        pPr = result.props;
        if (result.outlineLvl !== null)
          outlineLvl = result.outlineLvl;
        break;
      }
    }
  }
  const headingLevel = resolveHeadingLevel(name, outlineLvl);
  return { styleId, name, type, headingLevel, basedOn, rPr, pPr };
}
function parseRPr(el2) {
  const props = {};
  for (const child of el2.children) {
    if (child.type !== "element")
      continue;
    const tag = localName2(child.tag);
    switch (tag) {
      case "b":
        props.bold = !isFalse(child.attrs["w:val"]);
        break;
      case "i":
        props.italic = !isFalse(child.attrs["w:val"]);
        break;
      case "u":
        props.underline = (child.attrs["w:val"] ?? "single") !== "none";
        break;
      case "strike":
        props.strikethrough = !isFalse(child.attrs["w:val"]);
        break;
      case "dstrike":
        props.doubleStrikethrough = !isFalse(child.attrs["w:val"]);
        break;
      case "vertAlign":
        if (child.attrs["w:val"] === "superscript")
          props.superscript = true;
        if (child.attrs["w:val"] === "subscript")
          props.subscript = true;
        break;
      case "smallCaps":
        props.smallCaps = !isFalse(child.attrs["w:val"]);
        break;
      case "caps":
        props.allCaps = !isFalse(child.attrs["w:val"]);
        break;
      case "color":
        props.color = normalizeColor(child.attrs["w:val"]);
        break;
      case "sz":
        props.fontSize = halfPointsToPoints(child.attrs["w:val"]);
        break;
      case "highlight":
        props.highlight = child.attrs["w:val"] ?? null;
        break;
      case "rFonts":
        props.fontFamily = child.attrs["w:ascii"] ?? child.attrs["w:hAnsi"] ?? null;
        break;
      case "lang":
        props.lang = child.attrs["w:val"] ?? null;
        break;
      case "rStyle":
        props.rStyleId = child.attrs["w:val"] ?? null;
        break;
    }
  }
  return props;
}
function parsePPr(el2) {
  const props = {};
  let outlineLvl = null;
  let hasSectPr = false;
  for (const child of el2.children) {
    if (child.type !== "element")
      continue;
    const tag = localName2(child.tag);
    switch (tag) {
      case "jc":
        props.alignment = normalizeAlignment(child.attrs["w:val"]);
        break;
      case "spacing": {
        const before = child.attrs["w:before"];
        const after = child.attrs["w:after"];
        const line = child.attrs["w:line"];
        const lineRule = child.attrs["w:lineRule"];
        if (before !== void 0)
          props.spaceBefore = twipsToCm(Number(before));
        if (after !== void 0)
          props.spaceAfter = twipsToCm(Number(after));
        if (line !== void 0) {
          if (!lineRule || lineRule === "auto") {
            props.lineHeight = Number(line) / 240;
          } else {
            props.lineHeight = Number(line) / 240;
          }
        }
        break;
      }
      case "ind": {
        const left = child.attrs["w:left"];
        const right = child.attrs["w:right"];
        const firstLine = child.attrs["w:firstLine"];
        const hanging = child.attrs["w:hanging"];
        if (left !== void 0)
          props.indentLeft = twipsToCm(Number(left));
        if (right !== void 0)
          props.indentRight = twipsToCm(Number(right));
        if (firstLine !== void 0)
          props.indentFirstLine = twipsToCm(Number(firstLine));
        else if (hanging !== void 0)
          props.indentFirstLine = -twipsToCm(Number(hanging));
        break;
      }
      case "pageBreakBefore":
        props.pageBreakBefore = !isFalse(child.attrs["w:val"]);
        break;
      case "numPr":
        props.list = parseNumPr(child);
        break;
      case "pBdr":
        props.borderBottom = parsePBdrBottom(child);
        break;
      case "outlineLvl":
        outlineLvl = Number(child.attrs["w:val"] ?? "0") + 1;
        break;
      case "sectPr":
        hasSectPr = true;
        break;
    }
  }
  return { props, outlineLvl, hasSectPr };
}
function parseNumPr(el2) {
  let numId = null;
  let level = 0;
  for (const child of el2.children) {
    if (child.type !== "element")
      continue;
    const tag = localName2(child.tag);
    if (tag === "ilvl")
      level = Number(child.attrs["w:val"] ?? "0");
    if (tag === "numId")
      numId = child.attrs["w:val"] ?? null;
  }
  if (!numId || numId === "0")
    return null;
  return { numId, level };
}
function parsePBdrBottom(el2) {
  for (const child of el2.children) {
    if (child.type !== "element")
      continue;
    if (localName2(child.tag) !== "bottom")
      continue;
    const val = child.attrs["w:val"] ?? "none";
    if (val === "none" || val === "nil")
      return null;
    const sz = Number(child.attrs["w:sz"] ?? "4");
    const color = normalizeColor(child.attrs["w:color"]) ?? "000000";
    return {
      style: normalizeBorderStyle(val),
      widthPt: sz / 8,
      // eighths of a point → points
      color
    };
  }
  return null;
}
function resolveHeadingLevel(name, outlineLvl) {
  const lower = name.toLowerCase().trim();
  const headingMatch = /^heading\s+(\d)$/.exec(lower);
  if (headingMatch) {
    const lvl = Number(headingMatch[1]);
    return lvl >= 1 && lvl <= 6 ? lvl : null;
  }
  if (lower === "title")
    return 1;
  if (lower === "subtitle")
    return 2;
  if (outlineLvl !== null && outlineLvl >= 1 && outlineLvl <= 6)
    return outlineLvl;
  return null;
}
function twipsToCm(twips) {
  return Number((twips / 1440 * 2.54).toFixed(4));
}
function halfPointsToPoints(val) {
  if (val === void 0)
    return null;
  const n = Number(val);
  return isNaN(n) ? null : n / 2;
}
function normalizeStyleType(raw) {
  switch (raw) {
    case "character":
      return "character";
    case "table":
      return "table";
    case "numbering":
      return "numbering";
    default:
      return "paragraph";
  }
}
function normalizeAlignment(val) {
  switch (val) {
    case "left":
      return "left";
    case "center":
      return "center";
    case "right":
      return "right";
    case "both":
      return "justify";
    default:
      return null;
  }
}
function normalizeColor(val) {
  if (!val || val === "auto")
    return null;
  return val.toUpperCase();
}
function normalizeBorderStyle(val) {
  switch (val) {
    case "dashed":
    case "dashSmallGap":
      return "dashed";
    case "dotted":
    case "dot":
      return "dotted";
    case "double":
      return "double";
    default:
      return "solid";
  }
}
function isFalse(val) {
  return val === "0" || val === "false";
}
function localName2(tag) {
  const colon = tag.indexOf(":");
  return colon === -1 ? tag : tag.slice(colon + 1);
}

// node_modules/odf-kit/dist/docx/to-odt/numbering.js
function parseNumbering(xml) {
  const map = /* @__PURE__ */ new Map();
  const root = parseXml(xml);
  const abstractNums = /* @__PURE__ */ new Map();
  for (const child of root.children) {
    if (child.type !== "element")
      continue;
    if (localName3(child.tag) !== "abstractNum")
      continue;
    const abstractNumId = child.attrs["w:abstractNumId"];
    if (!abstractNumId)
      continue;
    const levels = parseAbstractNum(child);
    abstractNums.set(abstractNumId, levels);
  }
  for (const child of root.children) {
    if (child.type !== "element")
      continue;
    if (localName3(child.tag) !== "num")
      continue;
    const numId = child.attrs["w:numId"];
    if (!numId)
      continue;
    let abstractNumId = null;
    const overrides = /* @__PURE__ */ new Map();
    for (const numChild of child.children) {
      if (numChild.type !== "element")
        continue;
      const tag = localName3(numChild.tag);
      if (tag === "abstractNumId") {
        abstractNumId = numChild.attrs["w:val"] ?? null;
      } else if (tag === "lvlOverride") {
        const ilvl = Number(numChild.attrs["w:ilvl"] ?? "0");
        const override = parseLvlOverride(numChild);
        if (override)
          overrides.set(ilvl, override);
      }
    }
    if (!abstractNumId)
      continue;
    const baseLevels = abstractNums.get(abstractNumId);
    if (!baseLevels)
      continue;
    const levels = baseLevels.map((lvl) => {
      const override = overrides.get(lvl.level);
      return override ? { ...lvl, ...override } : { ...lvl };
    });
    map.set(numId, levels);
  }
  return map;
}
function parseAbstractNum(el2) {
  const levels = [];
  for (const child of el2.children) {
    if (child.type !== "element")
      continue;
    if (localName3(child.tag) !== "lvl")
      continue;
    const level = parseLvl(child);
    if (level)
      levels.push(level);
  }
  return normalizeLevels(levels);
}
function parseLvl(el2) {
  const ilvl = el2.attrs["w:ilvl"];
  if (ilvl === void 0)
    return null;
  const level = Number(ilvl);
  let numFormat = "bullet";
  let start = 1;
  for (const child of el2.children) {
    if (child.type !== "element")
      continue;
    const tag = localName3(child.tag);
    if (tag === "numFmt") {
      numFormat = child.attrs["w:val"] ?? "bullet";
    } else if (tag === "start") {
      start = Number(child.attrs["w:val"] ?? "1");
    }
  }
  const isOrdered = isOrderedFormat(numFormat);
  return { level, isOrdered, numFormat, start };
}
function parseLvlOverride(el2) {
  const override = {};
  for (const child of el2.children) {
    if (child.type !== "element")
      continue;
    const tag = localName3(child.tag);
    if (tag === "startOverride") {
      override.start = Number(child.attrs["w:val"] ?? "1");
    } else if (tag === "lvl") {
      const lvl = parseLvl(child);
      if (lvl) {
        if (lvl.numFormat !== void 0)
          override.numFormat = lvl.numFormat;
        if (lvl.isOrdered !== void 0)
          override.isOrdered = lvl.isOrdered;
        if (lvl.start !== void 0)
          override.start = lvl.start;
      }
    }
  }
  return Object.keys(override).length > 0 ? override : null;
}
function isOrderedFormat(numFormat) {
  switch (numFormat) {
    case "bullet":
    case "none":
      return false;
    case "decimal":
    case "decimalZero":
    case "upperRoman":
    case "lowerRoman":
    case "upperLetter":
    case "lowerLetter":
    case "ordinal":
    case "cardinalText":
    case "ordinalText":
    case "hex":
    case "chicago":
    case "ideographDigital":
    case "japaneseCounting":
    case "aiueo":
    case "iroha":
    case "decimalFullWidth":
    case "decimalHalfWidth":
    case "japaneseLegal":
    case "japaneseDigitalTenThousand":
    case "decimalEnclosedCircle":
    case "decimalFullWidth2":
    case "aiueoFullWidth":
    case "irohaFullWidth":
    case "decimalZero2":
      return true;
    default:
      return !numFormat.toLowerCase().includes("bullet");
  }
}
function normalizeLevels(levels) {
  if (levels.length === 0)
    return [];
  levels.sort((a, b) => a.level - b.level);
  const maxLevel = levels[levels.length - 1].level;
  const filled = [];
  const byLevel = new Map(levels.map((l) => [l.level, l]));
  for (let i2 = 0; i2 <= maxLevel; i2++) {
    filled.push(byLevel.get(i2) ?? {
      level: i2,
      isOrdered: false,
      numFormat: "bullet",
      start: 1
    });
  }
  return filled;
}
function localName3(tag) {
  const colon = tag.indexOf(":");
  return colon === -1 ? tag : tag.slice(colon + 1);
}

// node_modules/odf-kit/dist/docx/to-odt/body-reader.js
function readBody(xml, rootTag, ctx) {
  const root = parseXml(xml);
  const container = findContainer(root, rootTag);
  collectBookmarkNames(container.children, ctx.bookmarkNames);
  return walkBodyChildren(container.children, ctx);
}
function readNotes(xml, noteTag, ctx) {
  const map = /* @__PURE__ */ new Map();
  const root = parseXml(xml);
  for (const child of root.children) {
    if (child.type !== "element")
      continue;
    if (localName4(child.tag) !== noteTag)
      continue;
    collectBookmarkNames(child.children, ctx.bookmarkNames);
  }
  for (const child of root.children) {
    if (child.type !== "element")
      continue;
    if (localName4(child.tag) !== noteTag)
      continue;
    const id = child.attrs["w:id"];
    const noteType = child.attrs["w:type"];
    if (!id || noteType === "separator" || noteType === "continuationSeparator")
      continue;
    const body = walkBodyChildren(child.children, ctx);
    map.set(id, { id, body });
  }
  return map;
}
function collectBookmarkNames(children, map) {
  for (const child of children) {
    if (child.type !== "element")
      continue;
    const tag = localName4(child.tag);
    if (tag === "bookmarkStart") {
      const id = child.attrs["w:id"];
      const name = child.attrs["w:name"];
      if (id && name)
        map.set(id, name);
    }
    if (child.children.length > 0) {
      collectBookmarkNames(child.children, map);
    }
  }
}
function findContainer(root, containerTag) {
  if (localName4(root.tag) === containerTag)
    return root;
  for (const child of root.children) {
    if (child.type !== "element")
      continue;
    if (localName4(child.tag) === containerTag)
      return child;
  }
  return root;
}
function walkBodyChildren(children, ctx) {
  const elements = [];
  for (const child of children) {
    if (child.type !== "element")
      continue;
    const tag = localName4(child.tag);
    switch (tag) {
      case "p":
        elements.push(...readParagraph(child, ctx));
        break;
      case "tbl":
        elements.push(readTable(child, ctx));
        break;
      case "sdt":
        elements.push(...readBlockSdt(child, ctx));
        break;
      case "customXml":
        elements.push(...walkBodyChildren(child.children, ctx));
        break;
      case "ins":
      case "moveTo":
        elements.push(...walkBodyChildren(child.children, ctx));
        break;
      case "bookmarkStart": {
        const id = child.attrs["w:id"];
        const name = id ? ctx.bookmarkNames.get(id) ?? id : null;
        if (name) {
          const bookmark = { type: "bookmark", name, position: "start" };
          elements.push(makeSingleRunParagraph(bookmark));
        }
        break;
      }
      case "bookmarkEnd": {
        const id = child.attrs["w:id"];
        const name = id ? ctx.bookmarkNames.get(id) ?? id : null;
        if (name) {
          const bookmark = { type: "bookmark", name, position: "end" };
          elements.push(makeSingleRunParagraph(bookmark));
        }
        break;
      }
      case "altChunk":
        ctx.warnings.push("w:altChunk (imported external content) is not supported and was skipped");
        break;
      // Intentionally skipped (correct per spec):
      case "del":
      case "moveFrom":
        break;
      case "sectPr":
        break;
      case "proofErr":
      case "permStart":
      case "permEnd":
      case "commentRangeStart":
      case "commentRangeEnd":
      case "customXmlDelRangeStart":
      case "customXmlDelRangeEnd":
      case "customXmlInsRangeStart":
      case "customXmlInsRangeEnd":
      case "customXmlMoveFromRangeStart":
      case "customXmlMoveFromRangeEnd":
      case "customXmlMoveToRangeStart":
      case "customXmlMoveToRangeEnd":
      case "moveFromRangeStart":
      case "moveFromRangeEnd":
      case "moveToRangeStart":
      case "moveToRangeEnd":
      case "oMath":
      case "oMathPara":
        break;
      default:
        break;
    }
  }
  return elements;
}
function makeSingleRunParagraph(inline) {
  return {
    type: "paragraph",
    headingLevel: null,
    styleId: null,
    props: { ...DEFAULT_PARA_PROPS },
    runs: [inline]
  };
}
function readParagraph(el2, ctx) {
  let styleId = null;
  let headingLevel = null;
  let paraProps = { ...DEFAULT_PARA_PROPS };
  for (const child of el2.children) {
    if (child.type !== "element")
      continue;
    if (localName4(child.tag) === "pPr") {
      const result = readPPr(child, ctx);
      styleId = result.styleId;
      headingLevel = result.headingLevel;
      paraProps = result.props;
      break;
    }
  }
  const allInline = processInlineChildren(el2.children, ctx);
  const results = splitOnPageBreaks(allInline, styleId, headingLevel, paraProps);
  if (paraProps.pageBreakBefore && results.length > 0) {
    results.unshift({ type: "pageBreak" });
  }
  return results;
}
function readPPr(el2, ctx) {
  let styleId = null;
  let headingLevel = null;
  for (const child of el2.children) {
    if (child.type !== "element")
      continue;
    const tag = localName4(child.tag);
    if (tag === "pStyle") {
      styleId = child.attrs["w:val"] ?? null;
      if (styleId) {
        const entry = ctx.styles.get(styleId);
        if (entry)
          headingLevel = entry.headingLevel;
      }
    }
    if (tag === "outlineLvl") {
      const val = Number(child.attrs["w:val"] ?? "0");
      if (val >= 0 && val <= 5)
        headingLevel = val + 1;
    }
  }
  const pprResult = parsePPr(el2);
  if (pprResult.hasSectPr) {
    ctx.warnings.push("Mid-document section break (w:sectPr in w:pPr) detected \u2014 multi-section page layout changes are not fully supported; final section layout is used for the whole document.");
  }
  const props = {
    alignment: pprResult.props.alignment ?? null,
    pageBreakBefore: pprResult.props.pageBreakBefore ?? false,
    spaceBefore: pprResult.props.spaceBefore ?? null,
    spaceAfter: pprResult.props.spaceAfter ?? null,
    lineHeight: pprResult.props.lineHeight ?? null,
    indentLeft: pprResult.props.indentLeft ?? null,
    indentRight: pprResult.props.indentRight ?? null,
    indentFirstLine: pprResult.props.indentFirstLine ?? null,
    list: pprResult.props.list ?? null,
    borderBottom: pprResult.props.borderBottom ?? null
  };
  return { styleId, headingLevel, props, hasSectPr: pprResult.hasSectPr };
}
function isPageBreakMarker(el2) {
  return el2.type === "pageBreakMarker";
}
function splitOnPageBreaks(allInline, styleId, headingLevel, props) {
  const results = [];
  let current = [];
  function flushParagraph() {
    results.push({
      type: "paragraph",
      headingLevel,
      styleId,
      props,
      runs: current
    });
    current = [];
  }
  for (const el2 of allInline) {
    if (isPageBreakMarker(el2)) {
      flushParagraph();
      results.push({ type: "pageBreak" });
    } else {
      current.push(el2);
    }
  }
  flushParagraph();
  return results;
}
function processInlineChildren(children, ctx) {
  const results = [];
  const field = {
    active: false,
    instrText: "",
    displayRuns: [],
    phase: "before-separate"
  };
  for (const child of children) {
    if (child.type !== "element")
      continue;
    const tag = localName4(child.tag);
    switch (tag) {
      case "r":
        processRunElement(child, field, ctx, results);
        break;
      case "hyperlink": {
        const link = readHyperlink(child, ctx);
        if (link)
          results.push(link);
        break;
      }
      case "fldSimple": {
        const instr = (child.attrs["w:instr"] ?? "").trim();
        const displayRuns = [];
        for (const fc of child.children) {
          if (fc.type !== "element")
            continue;
          if (localName4(fc.tag) === "r") {
            const items = readRun(fc, ctx);
            for (const item of items) {
              if (item.type === "run")
                displayRuns.push(item);
            }
          }
        }
        const resolved = resolveField({ active: true, instrText: instr, displayRuns, phase: "after-separate" }, ctx);
        if (resolved)
          results.push(resolved);
        break;
      }
      case "smartTag":
        results.push(...processInlineChildren(child.children, ctx));
        break;
      case "dir":
      case "bdo":
        results.push(...processInlineChildren(child.children, ctx));
        break;
      case "ins":
      case "moveTo":
        for (const insChild of child.children) {
          if (insChild.type !== "element")
            continue;
          if (localName4(insChild.tag) === "r") {
            processRunElement(insChild, field, ctx, results);
          }
        }
        break;
      case "del":
      case "moveFrom":
        break;
      case "bookmarkStart": {
        const id = child.attrs["w:id"];
        const name = id ? ctx.bookmarkNames.get(id) ?? id : null;
        if (name)
          results.push({ type: "bookmark", name, position: "start" });
        break;
      }
      case "bookmarkEnd": {
        const id = child.attrs["w:id"];
        const name = id ? ctx.bookmarkNames.get(id) ?? id : null;
        if (name)
          results.push({ type: "bookmark", name, position: "end" });
        break;
      }
      case "sdt":
        results.push(...readInlineSdt(child, ctx));
        break;
      case "customXml":
        results.push(...processInlineChildren(child.children, ctx));
        break;
      case "proofErr":
      case "permStart":
      case "permEnd":
      case "commentRangeStart":
      case "commentRangeEnd":
        break;
      case "pPr":
        break;
      default:
        break;
    }
  }
  if (field.active && field.displayRuns.length > 0) {
    ctx.warnings.push("Unclosed complex field at end of paragraph \u2014 display text recovered");
    results.push(...field.displayRuns);
  }
  return results;
}
function processRunElement(runEl, field, ctx, results) {
  let hasFldChar = false;
  for (const child of runEl.children) {
    if (child.type === "element" && localName4(child.tag) === "fldChar") {
      hasFldChar = true;
      break;
    }
  }
  if (!hasFldChar && !field.active) {
    results.push(...readRun(runEl, ctx));
    return;
  }
  for (const child of runEl.children) {
    if (child.type !== "element")
      continue;
    const tag = localName4(child.tag);
    if (tag === "fldChar") {
      const fldCharType = child.attrs["w:fldCharType"];
      if (fldCharType === "begin") {
        field.active = true;
        field.instrText = "";
        field.displayRuns = [];
        field.phase = "before-separate";
      } else if (fldCharType === "separate") {
        field.phase = "after-separate";
      } else if (fldCharType === "end") {
        const resolved = resolveField(field, ctx);
        if (resolved)
          results.push(resolved);
        field.active = false;
        field.instrText = "";
        field.displayRuns = [];
      }
    } else if (tag === "instrText" && field.active && field.phase === "before-separate") {
      for (const n of child.children) {
        if (n.type === "text")
          field.instrText += n.text;
      }
    } else if (field.active && field.phase === "after-separate") {
      if (tag === "t") {
        let text = "";
        for (const n of child.children) {
          if (n.type === "text")
            text += n.text;
        }
        if (text) {
          field.displayRuns.push({ type: "run", text, props: { ...DEFAULT_RUN_PROPS } });
        }
      }
    } else if (!field.active) {
      const syntheticRun = {
        type: "element",
        tag: runEl.tag,
        attrs: runEl.attrs,
        children: [child]
      };
      results.push(...readRun(syntheticRun, ctx));
    }
  }
}
function resolveField(field, ctx) {
  const instr = field.instrText.trim();
  const isLocalAnchor = /\\l\b/.test(instr);
  const hyperlinkMatch = /HYPERLINK\s+(?:\\l\s+)?"([^"]+)"/.exec(instr);
  if (hyperlinkMatch) {
    const rawUrl = hyperlinkMatch[1];
    const url = isLocalAnchor ? "#" + rawUrl : rawUrl;
    return {
      type: "hyperlink",
      url,
      internal: isLocalAnchor,
      runs: field.displayRuns
    };
  }
  if (/^\s*PAGE\s*$/.test(instr) && field.displayRuns.length > 0) {
    return field.displayRuns[0];
  }
  if (field.displayRuns.length > 0) {
    ctx.warnings.push(`Unrecognized field instruction: "${instr.slice(0, 80).trim()}"`);
    return field.displayRuns[0];
  }
  return null;
}
function readRun(el2, ctx) {
  const results = [];
  let runProps = { ...DEFAULT_RUN_PROPS };
  for (const child of el2.children) {
    if (child.type !== "element")
      continue;
    if (localName4(child.tag) === "rPr") {
      runProps = mergeRunProps(DEFAULT_RUN_PROPS, parseRPr(child));
      break;
    }
  }
  let pendingText = "";
  function flushText() {
    if (pendingText.length > 0) {
      results.push({ type: "run", text: pendingText, props: runProps });
      pendingText = "";
    }
  }
  for (const child of el2.children) {
    if (child.type !== "element")
      continue;
    const tag = localName4(child.tag);
    switch (tag) {
      case "t": {
        for (const n of child.children) {
          if (n.type === "text")
            pendingText += n.text;
        }
        break;
      }
      case "br": {
        const brType = child.attrs["w:type"];
        if (brType === "page" || brType === "column") {
          flushText();
          results.push({ type: "pageBreakMarker" });
        } else {
          flushText();
          results.push({ type: "lineBreak" });
        }
        break;
      }
      case "tab":
        flushText();
        results.push({ type: "tab" });
        break;
      case "ptab":
        flushText();
        results.push({ type: "tab" });
        break;
      case "drawing":
        flushText();
        {
          const img = readDrawing(child, ctx);
          if (img)
            results.push(img);
        }
        break;
      case "pict":
        flushText();
        {
          const img = readPict(child, ctx);
          if (img)
            results.push(img);
        }
        break;
      case "footnoteReference": {
        flushText();
        const id = child.attrs["w:id"];
        if (id)
          results.push({ type: "footnoteReference", id });
        break;
      }
      case "endnoteReference": {
        flushText();
        const id = child.attrs["w:id"];
        if (id)
          results.push({ type: "endnoteReference", id });
        break;
      }
      case "sym": {
        flushText();
        const charCode = child.attrs["w:char"];
        if (charCode) {
          const text = String.fromCodePoint(parseInt(charCode, 16));
          results.push({ type: "run", text, props: runProps });
        }
        break;
      }
      case "noBreakHyphen":
        pendingText += "\u2011";
        break;
      case "softHyphen":
        pendingText += "\xAD";
        break;
      case "cr":
        flushText();
        results.push({ type: "lineBreak" });
        break;
      case "lastRenderedPageBreak":
        flushText();
        results.push({ type: "pageBreakMarker" });
        break;
      case "rPr":
      case "fldChar":
      case "instrText":
        break;
      default:
        break;
    }
  }
  flushText();
  return results;
}
function readHyperlink(el2, ctx) {
  const rId = el2.attrs["r:id"];
  const anchor = el2.attrs["w:anchor"];
  let url = "";
  let internal = false;
  if (rId) {
    const rel = ctx.relationships.get(rId);
    if (rel) {
      url = rel.target;
      internal = !rel.external;
      if (internal)
        url = "#" + url;
    }
  } else if (anchor) {
    url = "#" + anchor;
    internal = true;
  }
  if (!url)
    return null;
  const runs = [];
  for (const child of el2.children) {
    if (child.type !== "element")
      continue;
    const tag = localName4(child.tag);
    if (tag === "r") {
      const items = readRun(child, ctx);
      for (const item of items) {
        if (item.type === "run")
          runs.push(item);
      }
    }
  }
  return { type: "hyperlink", url, internal, runs };
}
function readDrawing(el2, ctx) {
  for (const child of el2.children) {
    if (child.type !== "element")
      continue;
    const tag = localName4(child.tag);
    if (tag !== "inline" && tag !== "anchor")
      continue;
    let widthEmu = 0;
    let heightEmu = 0;
    let rId = null;
    let altText = null;
    for (const prop of child.children) {
      if (prop.type !== "element")
        continue;
      const ptag = localName4(prop.tag);
      if (ptag === "extent") {
        widthEmu = Number(prop.attrs["cx"] ?? "0");
        heightEmu = Number(prop.attrs["cy"] ?? "0");
      } else if (ptag === "docPr") {
        altText = prop.attrs["descr"] ?? prop.attrs["title"] ?? null;
      } else if (ptag === "graphic") {
        rId = findBlipRId(prop);
      }
    }
    if (!rId) {
      ctx.warnings.push("w:drawing found but no image relationship could be resolved \u2014 image skipped");
      return null;
    }
    return {
      type: "inlineImage",
      rId,
      widthCm: emuToCm(widthEmu),
      heightCm: emuToCm(heightEmu),
      altText
    };
  }
  return null;
}
function findBlipRId(graphicEl) {
  for (const child of graphicEl.children) {
    if (child.type !== "element")
      continue;
    if (localName4(child.tag) === "graphicData") {
      return findBlipInGraphicData(child);
    }
  }
  return null;
}
function findBlipInGraphicData(el2) {
  for (const child of el2.children) {
    if (child.type !== "element")
      continue;
    if (localName4(child.tag) === "pic") {
      for (const picChild of child.children) {
        if (picChild.type !== "element")
          continue;
        if (localName4(picChild.tag) === "blipFill") {
          for (const bfChild of picChild.children) {
            if (bfChild.type !== "element")
              continue;
            if (localName4(bfChild.tag) === "blip") {
              return bfChild.attrs["r:embed"] ?? null;
            }
          }
        }
      }
    }
  }
  return null;
}
function readPict(el2, ctx) {
  for (const child of el2.children) {
    if (child.type !== "element")
      continue;
    if (localName4(child.tag) !== "shape")
      continue;
    const style = child.attrs["style"] ?? "";
    const { widthCm, heightCm } = parseVmlStyle(style);
    let rId = null;
    let altText = null;
    for (const shapeChild of child.children) {
      if (shapeChild.type !== "element")
        continue;
      if (localName4(shapeChild.tag) === "imagedata") {
        rId = shapeChild.attrs["r:id"] ?? shapeChild.attrs["r:href"] ?? null;
        altText = shapeChild.attrs["o:title"] ?? null;
      }
    }
    if (!rId) {
      ctx.warnings.push("w:pict found but no r:id on v:imagedata \u2014 image skipped");
      return null;
    }
    return { type: "inlineImage", rId, widthCm, heightCm, altText };
  }
  return null;
}
function parseVmlStyle(style) {
  const DEFAULT_CM = 2.54;
  let widthCm = DEFAULT_CM;
  let heightCm = DEFAULT_CM;
  const widthMatch = /width:\s*([\d.]+)(pt|cm|in|px)/.exec(style);
  const heightMatch = /height:\s*([\d.]+)(pt|cm|in|px)/.exec(style);
  if (widthMatch)
    widthCm = vmlUnitToCm(Number(widthMatch[1]), widthMatch[2]);
  if (heightMatch)
    heightCm = vmlUnitToCm(Number(heightMatch[1]), heightMatch[2]);
  return { widthCm, heightCm };
}
function vmlUnitToCm(value, unit) {
  switch (unit) {
    case "cm":
      return value;
    case "pt":
      return value / 72 * 2.54;
    case "in":
      return value * 2.54;
    case "px":
      return value / 96 * 2.54;
    // assumes 96dpi
    default:
      return value;
  }
}
function readTable(el2, ctx) {
  const columnWidths = [];
  const rows = [];
  for (const child of el2.children) {
    if (child.type !== "element")
      continue;
    const tag = localName4(child.tag);
    if (tag === "tblGrid") {
      for (const gc of child.children) {
        if (gc.type !== "element")
          continue;
        if (localName4(gc.tag) === "gridCol") {
          const w = Number(gc.attrs["w:w"] ?? "0");
          columnWidths.push(twipsToCm2(w));
        }
      }
    } else if (tag === "tr") {
      rows.push(readTableRow(child, ctx));
    } else if (tag === "sdt") {
      const sdtContent = findSdtContent(child);
      if (sdtContent) {
        for (const sdtChild of sdtContent.children) {
          if (sdtChild.type !== "element")
            continue;
          if (localName4(sdtChild.tag) === "tr") {
            rows.push(readTableRow(sdtChild, ctx));
          }
        }
      }
    }
  }
  return { type: "table", columnWidths, rows };
}
function readTableRow(el2, ctx) {
  const cells = [];
  for (const child of el2.children) {
    if (child.type !== "element")
      continue;
    const tag = localName4(child.tag);
    if (tag === "tc") {
      cells.push(readTableCell(child, ctx));
    } else if (tag === "sdt") {
      const sdtContent = findSdtContent(child);
      if (sdtContent) {
        for (const sdtChild of sdtContent.children) {
          if (sdtChild.type !== "element")
            continue;
          if (localName4(sdtChild.tag) === "tc") {
            cells.push(readTableCell(sdtChild, ctx));
          }
        }
      }
    }
  }
  return { cells };
}
function readTableCell(el2, ctx) {
  let colSpan = 1;
  let vMerge = null;
  let backgroundColor = null;
  let verticalAlign = null;
  for (const child of el2.children) {
    if (child.type !== "element")
      continue;
    if (localName4(child.tag) !== "tcPr")
      continue;
    for (const prop of child.children) {
      if (prop.type !== "element")
        continue;
      const ptag = localName4(prop.tag);
      if (ptag === "gridSpan") {
        colSpan = Number(prop.attrs["w:val"] ?? "1");
      } else if (ptag === "vMerge") {
        vMerge = prop.attrs["w:val"] === "restart" ? "restart" : "continue";
      } else if (ptag === "shd") {
        const fill = prop.attrs["w:fill"];
        if (fill && fill !== "auto")
          backgroundColor = fill.toUpperCase();
      } else if (ptag === "vAlign") {
        verticalAlign = normalizeVAlign(prop.attrs["w:val"]);
      }
    }
    break;
  }
  const body = walkBodyChildren(el2.children, ctx);
  return { colSpan, vMerge, backgroundColor, verticalAlign, body };
}
function readBlockSdt(el2, ctx) {
  const { checkboxState, controlType } = readSdtPr(el2);
  if (checkboxState !== null) {
    const char = checkboxState ? "\u2611" : "\u2610";
    const run = { type: "run", text: char, props: { ...DEFAULT_RUN_PROPS } };
    return [
      {
        type: "paragraph",
        headingLevel: null,
        styleId: null,
        props: { ...DEFAULT_PARA_PROPS },
        runs: [run]
      }
    ];
  }
  warnUnknownSdtType(controlType, ctx);
  const content = findSdtContent(el2);
  if (!content)
    return [];
  return walkBodyChildren(content.children, ctx);
}
function readInlineSdt(el2, ctx) {
  const { checkboxState, controlType } = readSdtPr(el2);
  if (checkboxState !== null) {
    const char = checkboxState ? "\u2611" : "\u2610";
    return [{ type: "run", text: char, props: { ...DEFAULT_RUN_PROPS } }];
  }
  warnUnknownSdtType(controlType, ctx);
  const content = findSdtContent(el2);
  if (!content)
    return [];
  return processInlineChildren(content.children, ctx);
}
var KNOWN_SDT_TYPES = /* @__PURE__ */ new Set([
  "richText",
  "text",
  "date",
  "dropDownList",
  "comboBox",
  "picture",
  "docPart",
  "docPartObj",
  "docPartList",
  "citation",
  "bibliography",
  "group",
  "checkbox"
]);
function warnUnknownSdtType(controlType, ctx) {
  if (controlType !== null && !KNOWN_SDT_TYPES.has(controlType)) {
    ctx.warnings.push(`w:sdt control type "${controlType}" \u2014 content processed as plain text`);
  }
}
function readSdtPr(el2) {
  for (const child of el2.children) {
    if (child.type !== "element")
      continue;
    if (localName4(child.tag) !== "sdtPr")
      continue;
    for (const prop of child.children) {
      if (prop.type !== "element")
        continue;
      const tag = localName4(prop.tag);
      if (tag === "checkbox") {
        let checked = false;
        for (const cb of prop.children) {
          if (cb.type !== "element")
            continue;
          if (localName4(cb.tag) === "checked") {
            checked = cb.attrs["w14:val"] !== "0";
          }
        }
        return { checkboxState: checked, controlType: "checkbox" };
      }
      if (KNOWN_SDT_TYPES.has(tag)) {
        return { checkboxState: null, controlType: tag };
      }
      if (![
        "alias",
        "tag",
        "id",
        "lock",
        "placeholder",
        "showingPlcHdr",
        "dataBinding",
        "rPr",
        "color",
        "appearance"
      ].includes(tag)) {
        return { checkboxState: null, controlType: tag };
      }
    }
  }
  return { checkboxState: null, controlType: null };
}
function findSdtContent(el2) {
  for (const child of el2.children) {
    if (child.type !== "element")
      continue;
    if (localName4(child.tag) === "sdtContent")
      return child;
  }
  return null;
}
function emuToCm(emu) {
  return Number((emu / 914400 * 2.54).toFixed(4));
}
function twipsToCm2(twips) {
  return Number((twips / 1440 * 2.54).toFixed(4));
}
function mergeRunProps(base, override) {
  const result = { ...base };
  for (const [k, v] of Object.entries(override)) {
    if (v !== void 0)
      result[k] = v;
  }
  return result;
}
function normalizeVAlign(val) {
  switch (val) {
    case "top":
      return "top";
    case "center":
      return "center";
    case "bottom":
      return "bottom";
    default:
      return null;
  }
}
function localName4(tag) {
  const colon = tag.indexOf(":");
  return colon === -1 ? tag : tag.slice(colon + 1);
}

// node_modules/odf-kit/dist/docx/to-odt/reader.js
async function readDocx(input, warnings) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let zip;
  try {
    zip = unzipSync(bytes);
  } catch (err2) {
    throw new Error(`readDocx: failed to unzip input \u2014 is this a valid .docx file? (${err2})`, {
      cause: err2
    });
  }
  function getText(path) {
    const entry = zip[path] ?? zip[path.replace(/^\//, "")];
    if (!entry)
      return null;
    return new TextDecoder("utf-8").decode(entry);
  }
  const relsXml = getText("word/_rels/document.xml.rels");
  const relationships = relsXml ? parseRelationships(relsXml) : /* @__PURE__ */ new Map();
  const stylesXml = getText("word/styles.xml");
  const styles = stylesXml ? parseStyles(stylesXml) : /* @__PURE__ */ new Map();
  const numberingXml = getText("word/numbering.xml");
  const numbering = numberingXml ? parseNumbering(numberingXml) : /* @__PURE__ */ new Map();
  const images = /* @__PURE__ */ new Map();
  for (const [rId, rel] of relationships) {
    if (!isImageRel(rel.type))
      continue;
    if (rel.external)
      continue;
    const entry = zip[rel.target] ?? zip[rel.target.replace(/^\//, "")];
    if (!entry) {
      warnings.push(`Image rId "${rId}" references "${rel.target}" which is not in the ZIP`);
      continue;
    }
    const imageEntry = {
      bytes: entry,
      mimeType: mimeTypeFromPath(rel.target),
      filename: rel.target.split("/").pop() ?? rel.target
    };
    images.set(rId, imageEntry);
  }
  const coreXml = getText("docProps/core.xml");
  const metadata = coreXml ? parseCoreProperties(coreXml, warnings) : { title: null, creator: null, description: null, created: null, modified: null };
  const bookmarkNames = /* @__PURE__ */ new Map();
  const ctx = {
    styles,
    numbering,
    relationships,
    bookmarkNames,
    warnings
  };
  const footnotesXml = getText("word/footnotes.xml");
  const footnotes = footnotesXml ? readNotes(footnotesXml, "footnote", ctx) : /* @__PURE__ */ new Map();
  const endnotesXml = getText("word/endnotes.xml");
  const endnotes = endnotesXml ? readNotes(endnotesXml, "endnote", ctx) : /* @__PURE__ */ new Map();
  const headerTypeMap = /* @__PURE__ */ new Map();
  const footerTypeMap = /* @__PURE__ */ new Map();
  const documentXml = getText("word/document.xml");
  if (documentXml) {
    extractHdrFtrTypes(documentXml, headerTypeMap, footerTypeMap);
  }
  const headers = [];
  const footers = [];
  for (const [rId, rel] of relationships) {
    if (isHeaderRel(rel.type)) {
      const xml = getText(rel.target);
      if (xml) {
        const headerType = headerTypeMap.get(rId) ?? "default";
        const body2 = readBody(xml, "hdr", ctx);
        headers.push({ headerType, body: body2 });
      }
    } else if (isFooterRel(rel.type)) {
      const xml = getText(rel.target);
      if (xml) {
        const headerType = footerTypeMap.get(rId) ?? "default";
        const body2 = readBody(xml, "ftr", ctx);
        footers.push({ headerType, body: body2 });
      }
    }
  }
  let pageLayout = emptyPageLayout();
  if (documentXml) {
    pageLayout = extractPageLayout(documentXml, warnings);
  }
  if (!pageLayout.width && !pageLayout.marginTop) {
    const settingsXml = getText("word/settings.xml");
    if (settingsXml) {
      const settingsLayout = extractPageLayoutFromSettings(settingsXml, warnings);
      if (settingsLayout.width)
        pageLayout = settingsLayout;
    }
  }
  if (!documentXml) {
    throw new Error("readDocx: word/document.xml is missing \u2014 not a valid .docx file");
  }
  const body = readBody(documentXml, "body", ctx);
  for (const [, el2] of Object.entries({}))
    void el2;
  return {
    metadata,
    pageLayout,
    body,
    footnotes,
    endnotes,
    headers,
    footers,
    styles,
    numbering,
    relationships,
    images
  };
}
function parseCoreProperties(xml, warnings) {
  let title = null;
  let creator = null;
  let description = null;
  let created = null;
  let modified = null;
  let root;
  try {
    root = parseXml(xml);
  } catch {
    warnings.push("docProps/core.xml could not be parsed \u2014 metadata unavailable");
    return { title, creator, description, created, modified };
  }
  const container = localName5(root.tag) === "coreProperties" ? root : findChild(root, "coreProperties") ?? root;
  for (const child of container.children) {
    if (child.type !== "element")
      continue;
    const tag = localName5(child.tag);
    const text = textContent(child);
    switch (tag) {
      case "title":
        title = text || null;
        break;
      case "creator":
        creator = text || null;
        break;
      case "description":
        description = text || null;
        break;
      case "subject":
        if (!description)
          description = text || null;
        break;
      case "created":
        created = text || null;
        break;
      case "modified":
        modified = text || null;
        break;
      case "lastModifiedBy":
        break;
    }
  }
  return { title, creator, description, created, modified };
}
function extractPageLayout(documentXml, warnings) {
  let root;
  try {
    root = parseXml(documentXml);
  } catch {
    warnings.push("word/document.xml could not be re-parsed for page layout");
    return emptyPageLayout();
  }
  const body = findDescendant(root, "body");
  if (!body)
    return emptyPageLayout();
  let sectPr = null;
  for (const child of body.children) {
    if (child.type === "element" && localName5(child.tag) === "sectPr") {
      sectPr = child;
    }
  }
  if (!sectPr)
    return emptyPageLayout();
  return parseSectPr(sectPr);
}
function extractPageLayoutFromSettings(settingsXml, warnings) {
  let root;
  try {
    root = parseXml(settingsXml);
  } catch {
    warnings.push("word/settings.xml could not be parsed for page layout");
    return emptyPageLayout();
  }
  const sectPr = findChild(root, "sectPr");
  if (!sectPr)
    return emptyPageLayout();
  return parseSectPr(sectPr);
}
function parseSectPr(sectPr) {
  let width = null;
  let height = null;
  let orientation = null;
  let marginTop = null;
  let marginBottom = null;
  let marginLeft = null;
  let marginRight = null;
  for (const child of sectPr.children) {
    if (child.type !== "element")
      continue;
    const tag = localName5(child.tag);
    if (tag === "pgSz") {
      const w = child.attrs["w:w"];
      const h = child.attrs["w:h"];
      const orient = child.attrs["w:orient"];
      if (w !== void 0)
        width = twipsToCm3(Number(w));
      if (h !== void 0)
        height = twipsToCm3(Number(h));
      if (orient === "portrait" || orient === "landscape") {
        orientation = orient;
      } else if (width !== null && height !== null) {
        orientation = width > height ? "landscape" : "portrait";
      }
    } else if (tag === "pgMar") {
      const top = child.attrs["w:top"];
      const bottom = child.attrs["w:bottom"];
      const left = child.attrs["w:left"];
      const right = child.attrs["w:right"];
      if (top !== void 0)
        marginTop = twipsToCm3(Number(top));
      if (bottom !== void 0)
        marginBottom = twipsToCm3(Number(bottom));
      if (left !== void 0)
        marginLeft = twipsToCm3(Number(left));
      if (right !== void 0)
        marginRight = twipsToCm3(Number(right));
    }
  }
  return { width, height, orientation, marginTop, marginBottom, marginLeft, marginRight };
}
function emptyPageLayout() {
  return {
    width: null,
    height: null,
    orientation: null,
    marginTop: null,
    marginBottom: null,
    marginLeft: null,
    marginRight: null
  };
}
function extractHdrFtrTypes(documentXml, headerTypeMap, footerTypeMap) {
  let root;
  try {
    root = parseXml(documentXml);
  } catch {
    return;
  }
  collectSectPrRefs(root, headerTypeMap, footerTypeMap);
}
function collectSectPrRefs(node, headerTypeMap, footerTypeMap) {
  for (const child of node.children) {
    if (child.type !== "element")
      continue;
    const tag = localName5(child.tag);
    if (tag === "sectPr") {
      for (const ref of child.children) {
        if (ref.type !== "element")
          continue;
        const refTag = localName5(ref.tag);
        if (refTag === "headerReference" || refTag === "footerReference") {
          const rId = ref.attrs["r:id"] ?? ref.attrs["w:id"];
          const rawType = ref.attrs["w:type"] ?? "default";
          const hdrType = normalizeHdrFtrType(rawType);
          if (rId) {
            if (refTag === "headerReference")
              headerTypeMap.set(rId, hdrType);
            else
              footerTypeMap.set(rId, hdrType);
          }
        }
      }
    } else {
      collectSectPrRefs(child, headerTypeMap, footerTypeMap);
    }
  }
}
function normalizeHdrFtrType(raw) {
  if (raw === "first")
    return "first";
  if (raw === "even")
    return "even";
  return "default";
}
var REL_SUFFIXES = {
  image: "relationships/image",
  hyperlink: "relationships/hyperlink",
  footnotes: "relationships/footnotes",
  endnotes: "relationships/endnotes",
  header: "relationships/header",
  footer: "relationships/footer"
};
function relMatches(type, suffix) {
  return type.endsWith("/" + suffix);
}
function isImageRel(type) {
  return relMatches(type, REL_SUFFIXES.image);
}
function isHeaderRel(type) {
  return relMatches(type, REL_SUFFIXES.header);
}
function isFooterRel(type) {
  return relMatches(type, REL_SUFFIXES.footer);
}
var MIME_TYPES = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  bmp: "image/bmp",
  tiff: "image/tiff",
  tif: "image/tiff",
  webp: "image/webp",
  svg: "image/svg+xml",
  wmf: "image/x-wmf",
  emf: "image/x-emf"
};
function mimeTypeFromPath(path) {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return MIME_TYPES[ext] ?? "application/octet-stream";
}
function twipsToCm3(twips) {
  return Number((twips / 1440 * 2.54).toFixed(4));
}
function localName5(tag) {
  const colon = tag.indexOf(":");
  return colon === -1 ? tag : tag.slice(colon + 1);
}
function findChild(el2, name) {
  for (const child of el2.children) {
    if (child.type === "element" && localName5(child.tag) === name)
      return child;
  }
  return null;
}
function findDescendant(el2, name) {
  const queue = [el2];
  while (queue.length > 0) {
    const node = queue.shift();
    if (localName5(node.tag) === name)
      return node;
    for (const child of node.children) {
      if (child.type === "element")
        queue.push(child);
    }
  }
  return null;
}
function textContent(el2) {
  let text = "";
  for (const child of el2.children) {
    if (child.type === "text")
      text += child.text;
    else if (child.type === "element")
      text += textContent(child);
  }
  return text.trim();
}

// node_modules/odf-kit/dist/core/namespaces.js
var ODF_NS = {
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
var ODF_VERSION = "1.2";

// node_modules/odf-kit/dist/core/xml.js
function escapeXml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeAttr(value) {
  return escapeXml(value).replace(/"/g, "&quot;");
}
var XmlElement = class {
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
function el(tagName) {
  return new XmlElement(tagName);
}
function xmlDocument(root) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + root.serialize();
}
function xmlDocumentCompact(root) {
  return '<?xml version="1.0" encoding="UTF-8"?>' + root.serialize(0, true);
}

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

// node_modules/odf-kit/dist/core/styles.js
var HEADING_DEFS = [
  { level: 1, fontSize: "28pt", marginTop: "0.423cm", marginBottom: "0.212cm" },
  { level: 2, fontSize: "24pt", marginTop: "0.353cm", marginBottom: "0.212cm" },
  { level: 3, fontSize: "20pt", marginTop: "0.247cm", marginBottom: "0.212cm" },
  { level: 4, fontSize: "14pt", marginTop: "0.212cm", marginBottom: "0.141cm" },
  { level: 5, fontSize: "13pt", marginTop: "0.212cm", marginBottom: "0.141cm" },
  { level: 6, fontSize: "12pt", marginTop: "0.212cm", marginBottom: "0.141cm" }
];
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

// node_modules/odf-kit/dist/build-or-fill/build-odt/formatting.js
var CSS_NAMED_COLORS = {
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
var BULLET_CHARS = ["\u2022", "\u25E6", "\u25AA", "\u25B8", "\u2013", "\xB7"];
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

// node_modules/odf-kit/dist/build-or-fill/build-odt/paragraph-builder.js
var ParagraphBuilder = class {
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

// node_modules/odf-kit/dist/build-or-fill/build-odt/header-footer-builder.js
var HeaderFooterBuilder = class {
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

// node_modules/odf-kit/dist/core/length.js
var MAX_EMISSION_SEARCH_K = 25;
var MAX_EMISSION_SEARCH_K_BIG = BigInt(MAX_EMISSION_SEARCH_K);
var MAX_NUMERIC_LEXICAL = 64;
var FACTOR_MM = {
  mm: { n: 1n, d: 1n },
  cm: { n: 10n, d: 1n },
  in: { n: 127n, d: 5n },
  pt: { n: 127n, d: 360n },
  pc: { n: 127n, d: 30n },
  px: { n: 127n, d: 480n },
  twip: { n: 127n, d: 7200n },
  emu: { n: 127n, d: 4572000n }
};
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
function cmpRational(a, b) {
  const l = a.n * b.d;
  const r = b.n * a.d;
  return l < r ? -1 : l > r ? 1 : 0;
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
var UNIT_RE = /^([-+]?(?:\d+(?:\.\d*)?|\.\d+))(cm|mm|in|pt|pc|px)$/;
var PERCENT_RE = /^([-+]?(?:\d+(?:\.\d*)?|\.\d+))%$/;
var KEYWORD_RE = /^[A-Za-z][A-Za-z-]*$/;
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
function compareLengths(a, b) {
  const va = typeof a === "string" ? parseOdfValue(a) : a;
  const vb = typeof b === "string" ? parseOdfValue(b) : b;
  if (!va || !vb || va.kind !== "length" || vb.kind !== "length")
    return void 0;
  return cmpRational(va.mm, vb.mm);
}

// node_modules/odf-kit/dist/build-or-fill/build-odt/table-builder.js
var CellBuilder = class {
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
var RowBuilder = class {
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
var TableBuilder = class {
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

// node_modules/odf-kit/dist/build-or-fill/build-odt/list-builder.js
var ListBuilder = class _ListBuilder {
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
function buildItemRuns(content) {
  if (typeof content === "string") {
    return [{ text: content }];
  }
  const builder = new ParagraphBuilder();
  content(builder);
  return builder.runs;
}

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

// node_modules/odf-kit/dist/build-or-fill/build-odt/document.js
var ODT_MIME_TYPE = "application/vnd.oasis.opendocument.text";
var OdtDocument = class {
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

// node_modules/odf-kit/dist/docx/to-odt/converter.js
async function convertDocxToOdt(docxDoc, options, warnings) {
  const ctx = {
    doc: docxDoc,
    options,
    warnings,
    noteCounter: 0,
    pendingFootnotes: [],
    pendingEndnotes: []
  };
  const odt = new OdtDocument();
  const meta = options.metadata ?? {};
  const srcMeta = docxDoc.metadata;
  odt.setMetadata({
    title: meta.title ?? srcMeta.title ?? void 0,
    creator: meta.creator ?? srcMeta.creator ?? void 0,
    description: meta.description ?? srcMeta.description ?? void 0
  });
  const preserveLayout = options.preservePageLayout !== false;
  const layout = docxDoc.pageLayout;
  const pageLayout = {};
  if (preserveLayout && layout.width)
    pageLayout.width = `${layout.width}cm`;
  if (preserveLayout && layout.height)
    pageLayout.height = `${layout.height}cm`;
  if (preserveLayout && layout.orientation)
    pageLayout.orientation = layout.orientation;
  if (preserveLayout && layout.marginTop)
    pageLayout.marginTop = `${layout.marginTop}cm`;
  if (preserveLayout && layout.marginBottom)
    pageLayout.marginBottom = `${layout.marginBottom}cm`;
  if (preserveLayout && layout.marginLeft)
    pageLayout.marginLeft = `${layout.marginLeft}cm`;
  if (preserveLayout && layout.marginRight)
    pageLayout.marginRight = `${layout.marginRight}cm`;
  if (options.orientation)
    pageLayout.orientation = options.orientation;
  if (options.pageFormat && !pageLayout.width) {
    const dims = PAGE_FORMAT_DIMS[options.pageFormat];
    if (dims) {
      const isLandscape = (options.orientation ?? layout.orientation) === "landscape";
      pageLayout.width = isLandscape ? dims[1] : dims[0];
      pageLayout.height = isLandscape ? dims[0] : dims[1];
    }
  }
  if (Object.keys(pageLayout).length > 0) {
    odt.setPageLayout(pageLayout);
  }
  const defaultHeader = docxDoc.headers.find((h) => h.headerType === "default");
  const defaultFooter = docxDoc.footers.find((f) => f.headerType === "default");
  if (defaultHeader) {
    const text = extractPlainText(defaultHeader.body);
    if (text)
      odt.setHeader(text);
  }
  if (defaultFooter) {
    const text = extractPlainText(defaultFooter.body);
    if (text)
      odt.setFooter(text);
  }
  const grouped = groupListItems(docxDoc.body, docxDoc);
  convertGroupedElements(grouped, odt, ctx);
  if (ctx.pendingFootnotes.length > 0) {
    odt.addParagraph("");
    odt.addHeading("Footnotes", 6);
    for (const { marker, note } of ctx.pendingFootnotes) {
      const bodyText = extractPlainText(note.body);
      odt.addParagraph(`${marker} ${bodyText}`);
    }
  }
  if (ctx.pendingEndnotes.length > 0) {
    odt.addParagraph("");
    odt.addHeading("Endnotes", 6);
    for (const { marker, note } of ctx.pendingEndnotes) {
      const bodyText = extractPlainText(note.body);
      odt.addParagraph(`${marker} ${bodyText}`);
    }
  }
  return odt.save();
}
var PAGE_FORMAT_DIMS = {
  A4: ["21cm", "29.7cm"],
  letter: ["21.59cm", "27.94cm"],
  legal: ["21.59cm", "35.56cm"],
  A3: ["29.7cm", "42cm"],
  A5: ["14.8cm", "21cm"]
};
function groupListItems(elements, docxDoc) {
  const result = [];
  let i2 = 0;
  while (i2 < elements.length) {
    const el2 = elements[i2];
    if (el2.type === "paragraph" && el2.props.list) {
      const numId = el2.props.list.numId;
      const group = { kind: "listGroup", numId, items: [] };
      while (i2 < elements.length) {
        const cur = elements[i2];
        if (cur.type !== "paragraph" || !cur.props.list || cur.props.list.numId !== numId)
          break;
        const level = cur.props.list.level;
        const numEntry = resolveNumberingLevel(numId, level, docxDoc);
        group.items.push({
          level,
          runs: cur.runs,
          isOrdered: numEntry?.isOrdered ?? false,
          numFormat: numEntry?.numFormat ?? "bullet",
          start: numEntry?.start ?? 1
        });
        i2++;
      }
      result.push(group);
    } else {
      result.push(el2);
      i2++;
    }
  }
  return result;
}
function convertGroupedElements(elements, odt, ctx) {
  for (const el2 of elements) {
    if ("kind" in el2 && el2.kind === "listGroup") {
      convertListGroup(el2, odt, ctx);
    } else {
      convertBodyElement(el2, odt, ctx);
    }
  }
}
function convertBodyElement(el2, odt, ctx) {
  switch (el2.type) {
    case "pageBreak":
      odt.addPageBreak();
      break;
    case "paragraph":
      convertParagraph(el2, odt, ctx);
      break;
    case "table":
      convertTable(el2, odt, ctx);
      break;
  }
}
function convertParagraph(para, odt, ctx) {
  const headingLevel = resolveHeadingLevel2(para, ctx);
  const paraOptions = resolveParaOptions(para, ctx);
  const content = (p) => buildParagraphContent(para.runs, p, ctx);
  if (headingLevel !== null) {
    odt.addHeading(content, headingLevel, paraOptions);
  } else {
    odt.addParagraph(content, paraOptions);
  }
}
function resolveHeadingLevel2(para, ctx) {
  if (ctx.options.styleMap && para.styleId) {
    const styleName = ctx.doc.styles.get(para.styleId)?.name;
    if (styleName && ctx.options.styleMap[styleName] !== void 0) {
      return ctx.options.styleMap[styleName];
    }
  }
  if (para.headingLevel !== null) {
    return para.headingLevel;
  }
  if (para.styleId) {
    let entry = ctx.doc.styles.get(para.styleId);
    while (entry) {
      if (entry.headingLevel !== null)
        return entry.headingLevel;
      entry = entry.basedOn ? ctx.doc.styles.get(entry.basedOn) ?? void 0 : void 0;
    }
  }
  return null;
}
function resolveParaOptions(para, ctx) {
  const chain = getStyleChain(para.styleId, ctx.doc.styles);
  const inherited = {};
  for (const entry of chain) {
    if (entry.pPr)
      mergeParaProps(inherited, entry.pPr);
  }
  mergeParaProps(inherited, para.props);
  return paraPropsToOptions(inherited);
}
function paraPropsToOptions(props) {
  const opts = {};
  let hasAny = false;
  if (props.alignment) {
    opts.align = props.alignment;
    hasAny = true;
  }
  if (props.spaceBefore != null) {
    opts.spaceBefore = `${props.spaceBefore}cm`;
    hasAny = true;
  }
  if (props.spaceAfter != null) {
    opts.spaceAfter = `${props.spaceAfter}cm`;
    hasAny = true;
  }
  if (props.lineHeight != null) {
    opts.lineHeight = props.lineHeight;
    hasAny = true;
  }
  if (props.indentLeft != null) {
    opts.indentLeft = `${props.indentLeft}cm`;
    hasAny = true;
  }
  if (props.indentFirstLine != null) {
    opts.indentFirst = `${props.indentFirstLine}cm`;
    hasAny = true;
  }
  if (props.borderBottom) {
    const b = props.borderBottom;
    opts.borderBottom = `${b.widthPt}pt ${b.style} #${b.color}`;
    hasAny = true;
  }
  return hasAny ? opts : void 0;
}
function buildParagraphContent(runs, p, ctx) {
  for (const el2 of runs) {
    switch (el2.type) {
      case "run":
        convertRun(el2, p, ctx);
        break;
      case "hyperlink": {
        if (el2.runs.length === 0)
          break;
        const text = el2.runs.map((r) => r.text).join("");
        const fmt = el2.runs[0] ? resolveRunFormatting(el2.runs[0], ctx) : void 0;
        p.addLink(text, el2.url, fmt ?? void 0);
        break;
      }
      case "inlineImage": {
        const imgEntry = ctx.doc.images.get(el2.rId);
        if (!imgEntry) {
          ctx.warnings.push(`Image rId "${el2.rId}" not found in image map \u2014 skipped`);
          break;
        }
        p.addImage(imgEntry.bytes, {
          width: `${el2.widthCm}cm`,
          height: `${el2.heightCm}cm`,
          mimeType: imgEntry.mimeType,
          anchor: "as-character",
          alt: el2.altText ?? void 0
        });
        break;
      }
      case "footnoteReference": {
        ctx.noteCounter++;
        const marker = `[${ctx.noteCounter}]`;
        p.addText(marker, { superscript: true });
        const note = ctx.doc.footnotes.get(el2.id);
        if (note)
          ctx.pendingFootnotes.push({ marker, note });
        break;
      }
      case "endnoteReference": {
        ctx.noteCounter++;
        const marker = `[${ctx.noteCounter}]`;
        p.addText(marker, { superscript: true });
        const note = ctx.doc.endnotes.get(el2.id);
        if (note)
          ctx.pendingEndnotes.push({ marker, note });
        break;
      }
      case "bookmark":
        if (el2.position === "start") {
          p.addBookmark(el2.name);
        }
        break;
      case "tab":
        p.addTab();
        break;
      case "lineBreak":
        p.addLineBreak();
        break;
    }
  }
}
function convertRun(run, p, ctx) {
  if (!run.text)
    return;
  const fmt = resolveRunFormatting(run, ctx);
  p.addText(run.text, fmt ?? void 0);
}
function resolveRunFormatting(run, ctx) {
  const chain = getStyleChain(run.props.rStyleId, ctx.doc.styles);
  const inherited = {};
  for (const entry of chain) {
    if (entry.rPr)
      mergeRunProps2(inherited, entry.rPr);
  }
  mergeRunProps2(inherited, run.props);
  return runPropsToFormatting(inherited);
}
function runPropsToFormatting(props) {
  const fmt = {};
  let hasAny = false;
  if (props.bold) {
    fmt.bold = true;
    hasAny = true;
  }
  if (props.italic) {
    fmt.italic = true;
    hasAny = true;
  }
  if (props.underline) {
    fmt.underline = true;
    hasAny = true;
  }
  if (props.strikethrough || props.doubleStrikethrough) {
    fmt.strikethrough = true;
    hasAny = true;
  }
  if (props.superscript) {
    fmt.superscript = true;
    hasAny = true;
  }
  if (props.subscript) {
    fmt.subscript = true;
    hasAny = true;
  }
  if (props.smallCaps) {
    fmt.smallCaps = true;
    hasAny = true;
  }
  if (props.allCaps) {
    fmt.textTransform = "uppercase";
    hasAny = true;
  }
  if (props.color) {
    fmt.color = `#${props.color}`;
    hasAny = true;
  }
  if (props.fontSize != null) {
    fmt.fontSize = props.fontSize;
    hasAny = true;
  }
  if (props.fontFamily) {
    fmt.fontFamily = props.fontFamily;
    hasAny = true;
  }
  if (props.highlight) {
    const hex = HIGHLIGHT_COLORS[props.highlight.toLowerCase()];
    if (hex) {
      fmt.highlightColor = hex;
      hasAny = true;
    }
  }
  return hasAny ? fmt : null;
}
var HIGHLIGHT_COLORS = {
  yellow: "#FFFF00",
  green: "#00FF00",
  cyan: "#00FFFF",
  magenta: "#FF00FF",
  red: "#FF0000",
  blue: "#0000FF",
  darkblue: "#00008B",
  darkcyan: "#008B8B",
  darkgreen: "#006400",
  darkmagenta: "#8B008B",
  darkred: "#8B0000",
  darkyellow: "#8B8B00",
  darkgray: "#A9A9A9",
  lightgray: "#D3D3D3",
  black: "#000000",
  white: "#FFFFFF"
};
function convertTable(table, odt, ctx) {
  const tableOptions = {};
  if (table.columnWidths.length > 0) {
    tableOptions.columnWidths = table.columnWidths.map((w) => `${w}cm`);
  }
  const coveredCells = /* @__PURE__ */ new Map();
  odt.addTable((t) => {
    table.rows.forEach((row, rowIdx) => {
      t.addRow((r) => {
        let colIdx = 0;
        for (const cell of row.cells) {
          while (coveredCells.get(`${rowIdx}:${colIdx}`) ?? 0 > 0) {
            colIdx++;
          }
          const cellOptions = buildCellOptions(cell);
          if (cell.vMerge === "restart" && cell.colSpan >= 1) {
            const rowsSpanned = countRowSpan(table.rows, rowIdx, colIdx);
            if (rowsSpanned > 1) {
              cellOptions.rowSpan = rowsSpanned;
              for (let r2 = rowIdx + 1; r2 < rowIdx + rowsSpanned; r2++) {
                for (let c2 = colIdx; c2 < colIdx + cell.colSpan; c2++) {
                  coveredCells.set(`${r2}:${c2}`, 1);
                }
              }
            }
          }
          if (cell.vMerge === "continue") {
            colIdx += cell.colSpan;
            continue;
          }
          const cellContent = buildCellContent(cell, ctx);
          r.addCell(cellContent, cellOptions);
          colIdx += cell.colSpan;
        }
      });
    });
  }, tableOptions);
}
function buildCellOptions(cell) {
  const opts = {};
  if (cell.colSpan > 1)
    opts.colSpan = cell.colSpan;
  if (cell.backgroundColor)
    opts.backgroundColor = `#${cell.backgroundColor}`;
  if (cell.verticalAlign) {
    opts.verticalAlign = cell.verticalAlign === "center" ? "middle" : cell.verticalAlign;
  }
  return opts;
}
function buildCellContent(cell, ctx) {
  return (c) => {
    let first = true;
    for (const bodyEl of cell.body) {
      if (bodyEl.type !== "paragraph")
        continue;
      if (!first)
        c.addText(" / ");
      first = false;
      for (const run of bodyEl.runs) {
        if (run.type === "run" && run.text) {
          const fmt = resolveRunFormatting(run, ctx);
          if (fmt) {
            c.addText(run.text, fmt);
          } else {
            c.addText(run.text);
          }
        } else if (run.type === "hyperlink") {
          const text = run.runs.map((r) => r.text).join("");
          if (text)
            c.addText(text);
        }
      }
    }
  };
}
function countRowSpan(rows, startRow, colIdx) {
  let count = 1;
  for (let r = startRow + 1; r < rows.length; r++) {
    let col = 0;
    let found = false;
    for (const cell of rows[r].cells) {
      if (col === colIdx && cell.vMerge === "continue") {
        found = true;
        break;
      }
      col += cell.colSpan;
    }
    if (!found)
      break;
    count++;
  }
  return count;
}
function convertListGroup(group, odt, ctx) {
  if (group.items.length === 0)
    return;
  const level0 = group.items.find((i2) => i2.level === 0);
  const listOptions = buildListOptions(level0?.isOrdered ?? false, level0?.numFormat ?? "bullet", level0?.start ?? 1);
  const listData = buildNestedListData(group.items, 0, 0, ctx);
  listData.options = listOptions;
  odt.addList((builder) => {
    populateListBuilder(builder, listData, ctx);
  }, listOptions);
}
function buildListOptions(isOrdered, numFormat, start) {
  if (!isOrdered)
    return { type: "bullet" };
  const fmt = docxNumFormatToOdt(numFormat);
  const opts = { type: "numbered", numFormat: fmt };
  if (start !== 1)
    opts.startValue = start;
  return opts;
}
function docxNumFormatToOdt(numFormat) {
  switch (numFormat) {
    case "lowerLetter":
      return "a";
    case "upperLetter":
      return "A";
    case "lowerRoman":
      return "i";
    case "upperRoman":
      return "I";
    default:
      return "1";
  }
}
function buildNestedListData(items, startIdx, currentLevel, ctx) {
  const listItems = [];
  let i2 = startIdx;
  while (i2 < items.length) {
    const item = items[i2];
    if (item.level < currentLevel) {
      break;
    }
    if (item.level > currentLevel) {
      if (listItems.length === 0) {
        listItems.push({ runs: [] });
      }
      const nested = buildNestedListData(items, i2, item.level, ctx);
      const lastItem = listItems[listItems.length - 1];
      lastItem.nested = nested;
      i2 = advancePastLevel(items, i2, item.level);
      continue;
    }
    const runs = buildListItemRuns(item.runs, ctx);
    const listItem = { runs };
    const nextIdx = i2 + 1;
    if (nextIdx < items.length && items[nextIdx].level > currentLevel) {
      const nestedOptions = buildListOptions(items[nextIdx].isOrdered, items[nextIdx].numFormat, items[nextIdx].start);
      const nested = buildNestedListData(items, nextIdx, items[nextIdx].level, ctx);
      nested.options = nestedOptions;
      listItem.nested = nested;
      i2 = advancePastLevel(items, nextIdx, items[nextIdx].level);
    } else {
      i2++;
    }
    listItems.push(listItem);
  }
  return { items: listItems };
}
function advancePastLevel(items, startIdx, level) {
  let i2 = startIdx;
  while (i2 < items.length && items[i2].level >= level)
    i2++;
  return i2;
}
function buildListItemRuns(inlines, ctx) {
  const runs = [];
  for (const el2 of inlines) {
    if (el2.type === "run" && el2.text) {
      const fmt = resolveRunFormatting(el2, ctx);
      runs.push({ text: el2.text, formatting: fmt ?? void 0 });
    } else if (el2.type === "hyperlink") {
      const text = el2.runs.map((r) => r.text).join("");
      if (text)
        runs.push({ text, link: el2.url });
    } else if (el2.type === "tab") {
      runs.push({ text: "", field: "tab" });
    } else if (el2.type === "lineBreak") {
      runs.push({ text: "", lineBreak: true });
    }
  }
  return runs;
}
function populateListBuilder(builder, listData, ctx) {
  for (const item of listData.items) {
    if (item.runs.length > 0) {
      builder.addItem((p) => {
        for (const run of item.runs) {
          if (run.text)
            p.addText(run.text, run.formatting);
          else if (run.field === "tab")
            p.addTab();
          else if (run.lineBreak)
            p.addLineBreak();
        }
      });
    } else {
      builder.addItem("");
    }
    if (item.nested && item.nested.items.length > 0) {
      builder.addNested((sub) => {
        populateListBuilder(sub, item.nested, ctx);
      });
    }
  }
}
function getStyleChain(styleId, styles) {
  if (!styleId)
    return [];
  const chain = [];
  let id = styleId;
  const visited = /* @__PURE__ */ new Set();
  while (id && !visited.has(id)) {
    visited.add(id);
    const entry = styles.get(id);
    if (!entry)
      break;
    chain.unshift(entry);
    id = entry.basedOn;
  }
  return chain;
}
function mergeParaProps(base, override) {
  if (override.alignment !== void 0)
    base.alignment = override.alignment;
  if (override.pageBreakBefore !== void 0)
    base.pageBreakBefore = override.pageBreakBefore;
  if (override.spaceBefore !== void 0)
    base.spaceBefore = override.spaceBefore;
  if (override.spaceAfter !== void 0)
    base.spaceAfter = override.spaceAfter;
  if (override.lineHeight !== void 0)
    base.lineHeight = override.lineHeight;
  if (override.indentLeft !== void 0)
    base.indentLeft = override.indentLeft;
  if (override.indentRight !== void 0)
    base.indentRight = override.indentRight;
  if (override.indentFirstLine !== void 0)
    base.indentFirstLine = override.indentFirstLine;
  if (override.list !== void 0)
    base.list = override.list;
  if (override.borderBottom !== void 0)
    base.borderBottom = override.borderBottom;
}
function mergeRunProps2(base, override) {
  if (override.bold !== void 0)
    base.bold = override.bold;
  if (override.italic !== void 0)
    base.italic = override.italic;
  if (override.underline !== void 0)
    base.underline = override.underline;
  if (override.strikethrough !== void 0)
    base.strikethrough = override.strikethrough;
  if (override.doubleStrikethrough !== void 0)
    base.doubleStrikethrough = override.doubleStrikethrough;
  if (override.superscript !== void 0)
    base.superscript = override.superscript;
  if (override.subscript !== void 0)
    base.subscript = override.subscript;
  if (override.smallCaps !== void 0)
    base.smallCaps = override.smallCaps;
  if (override.allCaps !== void 0)
    base.allCaps = override.allCaps;
  if (override.color !== void 0)
    base.color = override.color;
  if (override.fontSize !== void 0)
    base.fontSize = override.fontSize;
  if (override.highlight !== void 0)
    base.highlight = override.highlight;
  if (override.fontFamily !== void 0)
    base.fontFamily = override.fontFamily;
  if (override.lang !== void 0)
    base.lang = override.lang;
  if (override.rStyleId !== void 0)
    base.rStyleId = override.rStyleId;
}
function resolveNumberingLevel(numId, level, docxDoc) {
  const levels = docxDoc.numbering?.get(numId);
  if (!levels)
    return null;
  return levels[level] ?? levels[0] ?? null;
}
function extractPlainText(elements) {
  const parts = [];
  for (const el2 of elements) {
    if (el2.type !== "paragraph")
      continue;
    for (const run of el2.runs) {
      if (run.type === "run")
        parts.push(run.text);
      else if (run.type === "hyperlink") {
        parts.push(run.runs.map((r) => r.text).join(""));
      }
    }
  }
  return parts.join("").trim();
}

// node_modules/odf-kit/dist/docx/to-odt/index.js
async function docxToOdt(input, options = {}) {
  const warnings = [];
  const docxDoc = await readDocx(input, warnings);
  const bytes = await convertDocxToOdt(docxDoc, options, warnings);
  return { bytes, warnings };
}
export {
  docxToOdt
};
