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
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
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
var et = /* @__PURE__ */ new u8(0);
var b2 = function(d, b) {
  return d[b] | d[b + 1] << 8;
};
var b4 = function(d, b) {
  return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
};
var b8 = function(d, b) {
  return b4(d, b) + b4(d, b + 4) * 4294967296;
};
function inflateSync(data, opts) {
  return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
}
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

// node_modules/odf-kit/dist/reader/xml-parser.js
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

// node_modules/odf-kit/dist/reader/registry.js
function findChild(node, tag) {
  for (const child of node.children) {
    if (child.type === "element" && child.tag === tag)
      return child;
  }
  return void 0;
}
function findChildren(node, tag) {
  const result = [];
  for (const child of node.children) {
    if (child.type === "element" && child.tag === tag)
      result.push(child);
  }
  return result;
}
var TEXT_PROPS_TAG = "style:text-properties";
var PARA_PROPS_TAG = "style:paragraph-properties";
var GRAPHIC_PROPS_TAG = "style:graphic-properties";
var CELL_PROPS_TAGS = /* @__PURE__ */ new Set([
  "style:table-cell-properties",
  "style:table-row-properties",
  "style:table-column-properties",
  "style:table-properties"
]);
function collectRawStyle(styleEl, family, parentName, displayName) {
  const textProps = /* @__PURE__ */ new Map();
  const paragraphProps = /* @__PURE__ */ new Map();
  const cellProps = /* @__PURE__ */ new Map();
  const graphicProps = /* @__PURE__ */ new Map();
  for (const child of styleEl.children) {
    if (child.type !== "element")
      continue;
    if (child.tag === TEXT_PROPS_TAG) {
      for (const [k, v] of Object.entries(child.attrs)) {
        textProps.set(k, v);
      }
    } else if (child.tag === PARA_PROPS_TAG) {
      for (const [k, v] of Object.entries(child.attrs)) {
        paragraphProps.set(k, v);
      }
    } else if (child.tag === GRAPHIC_PROPS_TAG) {
      for (const [k, v] of Object.entries(child.attrs)) {
        graphicProps.set(k, v);
      }
    } else if (CELL_PROPS_TAGS.has(child.tag)) {
      for (const [k, v] of Object.entries(child.attrs)) {
        cellProps.set(k, v);
      }
    }
  }
  return { family, parentName, displayName, textProps, paragraphProps, cellProps, graphicProps };
}
function scanFontFaces(container, fontFaces) {
  for (const child of findChildren(container, "style:font-face")) {
    const name = child.attrs["style:name"];
    const family = child.attrs["svg:font-family"];
    if (name && family) {
      fontFaces.set(name, family);
    }
  }
}
function scanStylesContainer(container, isAutomatic, named, automatic, defaults) {
  for (const child of container.children) {
    if (child.type !== "element")
      continue;
    if (child.tag === "style:default-style") {
      const family = child.attrs["style:family"];
      if (!family)
        continue;
      const raw = collectRawStyle(child, family);
      defaults.set(family, raw);
      continue;
    }
    if (child.tag === "style:style") {
      const name = child.attrs["style:name"];
      const family = child.attrs["style:family"];
      if (!name || !family)
        continue;
      const parentName = child.attrs["style:parent-style-name"];
      const displayName = child.attrs["style:display-name"];
      const raw = collectRawStyle(child, family, parentName, displayName);
      const key = `${family}:${name}`;
      if (isAutomatic) {
        automatic.set(key, raw);
      } else {
        named.set(key, raw);
      }
      continue;
    }
  }
}
function buildRegistry(contentRoot, stylesRoot) {
  const fontFaces = /* @__PURE__ */ new Map();
  const named = /* @__PURE__ */ new Map();
  const automatic = /* @__PURE__ */ new Map();
  const defaults = /* @__PURE__ */ new Map();
  const cache = /* @__PURE__ */ new Map();
  if (stylesRoot) {
    const fontDecls = findChild(stylesRoot, "office:font-face-decls");
    if (fontDecls)
      scanFontFaces(fontDecls, fontFaces);
    const namedEl = findChild(stylesRoot, "office:styles");
    if (namedEl)
      scanStylesContainer(namedEl, false, named, automatic, defaults);
    const autoEl = findChild(stylesRoot, "office:automatic-styles");
    if (autoEl)
      scanStylesContainer(autoEl, true, named, automatic, defaults);
  }
  const contentFontDecls = findChild(contentRoot, "office:font-face-decls");
  if (contentFontDecls)
    scanFontFaces(contentFontDecls, fontFaces);
  const contentNamedEl = findChild(contentRoot, "office:styles");
  if (contentNamedEl)
    scanStylesContainer(contentNamedEl, false, named, automatic, defaults);
  const contentAutoEl = findChild(contentRoot, "office:automatic-styles");
  if (contentAutoEl)
    scanStylesContainer(contentAutoEl, true, named, automatic, defaults);
  return { fontFaces, named, automatic, defaults, cache };
}
function resolve(registry, family, name) {
  const cacheKey = `${family}:${name}`;
  const cached = registry.cache.get(cacheKey);
  if (cached)
    return cached;
  const defaultRaw = registry.defaults.get(family);
  const result = {
    textProps: new Map(defaultRaw?.textProps),
    paragraphProps: new Map(defaultRaw?.paragraphProps),
    cellProps: new Map(defaultRaw?.cellProps),
    graphicProps: new Map(defaultRaw?.graphicProps)
  };
  const current = registry.automatic.get(cacheKey) ?? registry.named.get(cacheKey);
  if (!current) {
    registry.cache.set(cacheKey, result);
    return result;
  }
  const chain = [];
  let node = current;
  while (node) {
    chain.unshift(node);
    const parentName = node.parentName;
    if (!parentName)
      break;
    node = registry.named.get(`${family}:${parentName}`);
  }
  for (const raw of chain) {
    for (const [k, v] of raw.textProps)
      result.textProps.set(k, v);
    for (const [k, v] of raw.paragraphProps)
      result.paragraphProps.set(k, v);
    for (const [k, v] of raw.cellProps)
      result.cellProps.set(k, v);
    for (const [k, v] of raw.graphicProps)
      result.graphicProps.set(k, v);
  }
  registry.cache.set(cacheKey, result);
  return result;
}
function resolveFontFamily(textProps, fontFaces) {
  const direct = textProps.get("fo:font-family");
  if (direct)
    return direct;
  const fontName = textProps.get("style:font-name");
  if (fontName)
    return fontFaces.get(fontName);
  return void 0;
}

// node_modules/odf-kit/dist/reader/html-renderer.js
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function spanStyleToCss(style) {
  const parts = [];
  if (style.fontColor !== void 0)
    parts.push(`color:${style.fontColor}`);
  if (style.fontSize !== void 0)
    parts.push(`font-size:${style.fontSize}pt`);
  if (style.fontFamily !== void 0)
    parts.push(`font-family:${style.fontFamily}`);
  if (style.highlightColor !== void 0)
    parts.push(`background-color:${style.highlightColor}`);
  if (style.textTransform !== void 0)
    parts.push(`text-transform:${style.textTransform}`);
  if (style.fontVariant !== void 0)
    parts.push(`font-variant:${style.fontVariant}`);
  if (style.textShadow !== void 0)
    parts.push(`text-shadow:${style.textShadow}`);
  if (style.letterSpacing !== void 0)
    parts.push(`letter-spacing:${style.letterSpacing}`);
  return parts.join(";");
}
function paragraphStyleToCss(style) {
  const parts = [];
  if (style.textAlign !== void 0)
    parts.push(`text-align:${style.textAlign}`);
  if (style.marginLeft !== void 0)
    parts.push(`margin-left:${style.marginLeft}`);
  if (style.marginRight !== void 0)
    parts.push(`margin-right:${style.marginRight}`);
  if (style.marginTop !== void 0)
    parts.push(`margin-top:${style.marginTop}`);
  if (style.marginBottom !== void 0)
    parts.push(`margin-bottom:${style.marginBottom}`);
  if (style.paddingLeft !== void 0)
    parts.push(`padding-left:${style.paddingLeft}`);
  if (style.paddingRight !== void 0)
    parts.push(`padding-right:${style.paddingRight}`);
  if (style.lineHeight !== void 0)
    parts.push(`line-height:${style.lineHeight}`);
  return parts.join(";");
}
function cellStyleToCss(style) {
  const parts = [];
  if (style.backgroundColor !== void 0)
    parts.push(`background-color:${style.backgroundColor}`);
  if (style.verticalAlign !== void 0)
    parts.push(`vertical-align:${style.verticalAlign}`);
  if (style.border !== void 0) {
    if (style.border.top !== void 0)
      parts.push(`border-top:${style.border.top}`);
    if (style.border.bottom !== void 0)
      parts.push(`border-bottom:${style.border.bottom}`);
    if (style.border.left !== void 0)
      parts.push(`border-left:${style.border.left}`);
    if (style.border.right !== void 0)
      parts.push(`border-right:${style.border.right}`);
  }
  return parts.join(";");
}
function rowStyleToCss(style) {
  const parts = [];
  if (style.backgroundColor !== void 0)
    parts.push(`background-color:${style.backgroundColor}`);
  return parts.join(";");
}
function renderTextSpan(span) {
  if (span.lineBreak)
    return "<br>";
  if (span.hidden)
    return "";
  let html = escapeHtml(span.text);
  if (span.bold)
    html = `<strong>${html}</strong>`;
  if (span.italic)
    html = `<em>${html}</em>`;
  if (span.underline)
    html = `<u>${html}</u>`;
  if (span.strikethrough)
    html = `<s>${html}</s>`;
  if (span.superscript)
    html = `<sup>${html}</sup>`;
  if (span.subscript)
    html = `<sub>${html}</sub>`;
  if (span.style !== void 0) {
    const css = spanStyleToCss(span.style);
    if (css)
      html = `<span style="${css}">${html}</span>`;
  }
  if (span.href !== void 0)
    html = `<a href="${escapeHtml(span.href)}">${html}</a>`;
  return html;
}
function renderImage(node) {
  const attrs = [];
  if (node.data && node.mediaType) {
    attrs.push(`src="data:${node.mediaType};base64,${node.data}"`);
  }
  attrs.push(`alt="${escapeHtml(node.title ?? "")}"`);
  const styleParts = [];
  if (node.width !== void 0)
    styleParts.push(`width:${node.width}`);
  if (node.height !== void 0)
    styleParts.push(`height:${node.height}`);
  if (node.wrapMode === "left") {
    styleParts.push("float:left");
  } else if (node.wrapMode === "right") {
    styleParts.push("float:right");
  } else if (node.wrapMode === "none") {
    styleParts.push("display:block");
  }
  if (styleParts.length > 0)
    attrs.push(`style="${styleParts.join(";")}"`);
  if (node.description !== void 0 && node.name !== void 0) {
    const descId = `odf-img-${escapeHtml(node.name)}`;
    attrs.push(`aria-describedby="${descId}"`);
    const img = `<img ${attrs.join(" ")}>`;
    const desc = `<span id="${descId}" hidden>${escapeHtml(node.description)}</span>`;
    return img + desc;
  }
  return `<img ${attrs.join(" ")}>`;
}
function renderNote(node, options) {
  const refId = `odf-note-${escapeHtml(node.id)}-ref`;
  const noteId = `odf-note-${escapeHtml(node.id)}`;
  const citation = `<sup id="${refId}"><a href="#${noteId}">${escapeHtml(node.citation)}</a></sup>`;
  const bodyHtml = node.body.map((n) => renderBodyNode(n, options)).join("");
  const aside = `<aside id="${noteId}" role="note">${bodyHtml}</aside>`;
  return citation + aside;
}
function renderBookmark(node) {
  if (node.position === "end")
    return "";
  return `<a id="${escapeHtml(node.name)}"></a>`;
}
function renderField(node) {
  return escapeHtml(node.value);
}
function renderInlineNode(node, options) {
  if ("kind" in node) {
    switch (node.kind) {
      case "image":
        return renderImage(node);
      case "note":
        return renderNote(node, options);
      case "bookmark":
        return renderBookmark(node);
      case "field":
        return renderField(node);
    }
  }
  return renderTextSpan(node);
}
function renderSpans(spans, options) {
  return spans.map((n) => renderInlineNode(n, options)).join("");
}
function renderList(list, options) {
  const tag = list.ordered ? "ol" : "ul";
  const items = list.items.map((item) => {
    const content = renderSpans(item.spans, options);
    const nested = item.children !== void 0 ? renderList(item.children, options) : "";
    return `<li>${content}${nested}</li>`;
  }).join("");
  return `<${tag}>${items}</${tag}>`;
}
function renderCellContent(cell, options) {
  const body = cell.body && cell.body.length > 0 ? cell.body : [{ kind: "paragraph", spans: cell.spans }];
  return body.map((n) => renderBodyNode(n, options, true)).join("");
}
function renderRow(row, options, headerCells) {
  const rowCss = row.rowStyle !== void 0 ? rowStyleToCss(row.rowStyle) : "";
  const rowAttrs = rowCss ? ` style="${rowCss}"` : "";
  const tag = headerCells ? "th" : "td";
  const cells = row.cells.map((cell) => {
    const attrParts = [];
    if (headerCells)
      attrParts.push(`scope="col"`);
    if (cell.colSpan !== void 0 && cell.colSpan > 1) {
      attrParts.push(`colspan="${cell.colSpan}"`);
    }
    if (cell.rowSpan !== void 0 && cell.rowSpan > 1) {
      attrParts.push(`rowspan="${cell.rowSpan}"`);
    }
    if (cell.cellStyle !== void 0) {
      const css = cellStyleToCss(cell.cellStyle);
      if (css)
        attrParts.push(`style="${css}"`);
    }
    const attrs = attrParts.length > 0 ? " " + attrParts.join(" ") : "";
    return `<${tag}${attrs}>${renderCellContent(cell, options)}</${tag}>`;
  }).join("");
  return `<tr${rowAttrs}>${cells}</tr>`;
}
function renderTable(table, options) {
  let colgroup = "";
  for (const row of table.rows) {
    const cols = row.cells.map((cell) => {
      const cw = cell.cellStyle?.columnWidth;
      return cw ? `<col style="width:${cw}">` : "<col>";
    });
    if (row.cells.some((cell) => cell.cellStyle?.columnWidth !== void 0)) {
      colgroup = `<colgroup>${cols.join("")}</colgroup>`;
    }
    break;
  }
  const headerRows = table.rows.filter((row) => row.isHeader);
  const bodyRows = table.rows.filter((row) => !row.isHeader);
  if (headerRows.length === 0) {
    const rows = bodyRows.map((row) => renderRow(row, options, false)).join("");
    return `<table>${colgroup}${rows}</table>`;
  }
  const thead = `<thead>${headerRows.map((row) => renderRow(row, options, true)).join("")}</thead>`;
  const tbody = bodyRows.length > 0 ? `<tbody>${bodyRows.map((row) => renderRow(row, options, false)).join("")}</tbody>` : "";
  return `<table>${colgroup}${thead}${tbody}</table>`;
}
function renderSection(node, options) {
  const nameAttr = node.name ? ` data-name="${escapeHtml(node.name)}"` : "";
  const bodyHtml = node.body.map((n) => renderBodyNode(n, options)).join("\n");
  return `<section${nameAttr}>
${bodyHtml}
</section>`;
}
function renderTrackedChange(node, options) {
  const bodyHtml = node.body.map((n) => renderBodyNode(n, options)).join("\n");
  if (options?.trackedChanges !== "changes") {
    return bodyHtml;
  }
  const dataParts = [];
  if (node.author)
    dataParts.push(`data-author="${escapeHtml(node.author)}"`);
  if (node.date)
    dataParts.push(`data-date="${escapeHtml(node.date)}"`);
  const dataAttrs = dataParts.length > 0 ? " " + dataParts.join(" ") : "";
  switch (node.changeType) {
    case "insertion":
      return `<ins${dataAttrs}>${bodyHtml}</ins>`;
    case "deletion":
      return `<del${dataAttrs}>${bodyHtml}</del>`;
    case "format-change":
      return `<span class="odf-format-change"${dataAttrs}>${bodyHtml}</span>`;
  }
}
function renderBodyNode(node, options, inCell = false) {
  switch (node.kind) {
    case "paragraph": {
      const reset = inCell ? "margin-top:0;margin-bottom:0" : "";
      const sourceCss = node.paragraphStyle !== void 0 ? paragraphStyleToCss(node.paragraphStyle) : "";
      const css = [reset, sourceCss].filter((s) => s).join(";");
      const attrs = css ? ` style="${css}"` : "";
      return `<p${attrs}>${renderSpans(node.spans, options)}</p>`;
    }
    case "heading": {
      const reset = inCell ? "margin-top:0;margin-bottom:0" : "";
      const sourceCss = node.paragraphStyle !== void 0 ? paragraphStyleToCss(node.paragraphStyle) : "";
      const css = [reset, sourceCss].filter((s) => s).join(";");
      const attrs = css ? ` style="${css}"` : "";
      return `<h${node.level}${attrs}>${renderSpans(node.spans, options)}</h${node.level}>`;
    }
    case "list":
      return renderList(node, options);
    case "table":
      return renderTable(node, options);
    case "section":
      return renderSection(node, options);
    case "tracked-change":
      return renderTrackedChange(node, options);
  }
}
function renderHtml(body, options) {
  const inner = body.map((n) => renderBodyNode(n, options)).join("\n");
  if (options?.fragment === true)
    return inner;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
${inner}
</body>
</html>`;
}

// node_modules/odf-kit/dist/reader/parser.js
function findElement(node, tag) {
  for (const child of node.children) {
    if (child.type === "element" && child.tag === tag)
      return child;
  }
  return void 0;
}
function textContent(node) {
  return node.children.filter((c) => c.type === "text").map((c) => c.text).join("");
}
function mergeStyle(base, override) {
  const result = { ...base };
  if (override.bold !== void 0)
    result.bold = override.bold;
  if (override.italic !== void 0)
    result.italic = override.italic;
  if (override.underline !== void 0)
    result.underline = override.underline;
  if (override.strikethrough !== void 0)
    result.strikethrough = override.strikethrough;
  if (override.superscript !== void 0)
    result.superscript = override.superscript;
  if (override.subscript !== void 0)
    result.subscript = override.subscript;
  return result;
}
function mergeSpanStyle(base, override) {
  return { ...base, ...override };
}
function makeSpan(text, style, href, visualStyle) {
  const span = { text };
  if (style.bold)
    span.bold = true;
  if (style.italic)
    span.italic = true;
  if (style.underline)
    span.underline = true;
  if (style.strikethrough)
    span.strikethrough = true;
  if (style.superscript)
    span.superscript = true;
  if (style.subscript)
    span.subscript = true;
  if (href !== void 0)
    span.href = href;
  if (visualStyle !== void 0)
    span.style = visualStyle;
  return span;
}
function scanStylesElement(container, charStyles, listOrdered) {
  for (const child of container.children) {
    if (child.type !== "element")
      continue;
    if (child.tag === "style:style") {
      const name = child.attrs["style:name"];
      if (!name)
        continue;
      const textPropsEl = findElement(child, "style:text-properties");
      if (!textPropsEl)
        continue;
      const style = {};
      const p = textPropsEl.attrs;
      if ("fo:font-weight" in p)
        style.bold = p["fo:font-weight"] === "bold";
      if ("fo:font-style" in p)
        style.italic = p["fo:font-style"] === "italic";
      const underlineStyle = p["style:text-underline-style"];
      if (underlineStyle !== void 0 && underlineStyle !== "none")
        style.underline = true;
      const strikeStyle = p["style:text-line-through-style"];
      if (strikeStyle !== void 0 && strikeStyle !== "none")
        style.strikethrough = true;
      const textPosition = p["style:text-position"];
      if (textPosition !== void 0) {
        if (textPosition.startsWith("super"))
          style.superscript = true;
        if (textPosition.startsWith("sub"))
          style.subscript = true;
      }
      charStyles.set(name, style);
      continue;
    }
    if (child.tag === "text:list-style") {
      const name = child.attrs["style:name"];
      if (!name)
        continue;
      for (const levelChild of child.children) {
        if (levelChild.type !== "element")
          continue;
        if (levelChild.attrs["text:level"] !== "1")
          continue;
        if (levelChild.tag === "text:list-level-style-number") {
          listOrdered.set(name, true);
        } else if (levelChild.tag === "text:list-level-style-bullet") {
          listOrdered.set(name, false);
        }
      }
    }
  }
}
function buildStyleMaps(contentRoot, stylesRoot) {
  const charStyles = /* @__PURE__ */ new Map();
  const listOrdered = /* @__PURE__ */ new Map();
  if (stylesRoot) {
    const namedEl = findElement(stylesRoot, "office:styles");
    if (namedEl)
      scanStylesElement(namedEl, charStyles, listOrdered);
    const autoEl = findElement(stylesRoot, "office:automatic-styles");
    if (autoEl)
      scanStylesElement(autoEl, charStyles, listOrdered);
  }
  const contentNamedEl = findElement(contentRoot, "office:styles");
  if (contentNamedEl)
    scanStylesElement(contentNamedEl, charStyles, listOrdered);
  const contentAutoEl = findElement(contentRoot, "office:automatic-styles");
  if (contentAutoEl)
    scanStylesElement(contentAutoEl, charStyles, listOrdered);
  return { charStyles, listOrdered };
}
function parseManifest(manifestXml) {
  const types = /* @__PURE__ */ new Map();
  try {
    const root = parseXml(manifestXml);
    for (const child of root.children) {
      if (child.type !== "element" || child.tag !== "manifest:file-entry")
        continue;
      const path = child.attrs["manifest:full-path"];
      const mediaType = child.attrs["manifest:media-type"];
      if (path && mediaType)
        types.set(path, mediaType);
    }
  } catch {
  }
  return types;
}
function parseChangedRegions(bodyTextEl) {
  const regions = /* @__PURE__ */ new Map();
  const tcEl = findElement(bodyTextEl, "text:tracked-changes");
  if (!tcEl)
    return regions;
  for (const child of tcEl.children) {
    if (child.type !== "element" || child.tag !== "text:changed-region")
      continue;
    const id = child.attrs["text:id"];
    if (!id)
      continue;
    let type;
    let deletionEl;
    let author;
    let date;
    for (const regionChild of child.children) {
      if (regionChild.type !== "element")
        continue;
      if (regionChild.tag === "text:insertion") {
        type = "insertion";
        const creatorEl = findElement(regionChild, "dc:creator");
        if (creatorEl)
          author = textContent(creatorEl);
        const dateEl = findElement(regionChild, "dc:date");
        if (dateEl)
          date = textContent(dateEl);
      } else if (regionChild.tag === "text:deletion") {
        type = "deletion";
        deletionEl = regionChild;
        const creatorEl = findElement(regionChild, "dc:creator");
        if (creatorEl)
          author = textContent(creatorEl);
        const dateEl = findElement(regionChild, "dc:date");
        if (dateEl)
          date = textContent(dateEl);
      } else if (regionChild.tag === "text:format-change") {
        type = "format-change";
        const creatorEl = findElement(regionChild, "dc:creator");
        if (creatorEl)
          author = textContent(creatorEl);
        const dateEl = findElement(regionChild, "dc:date");
        if (dateEl)
          date = textContent(dateEl);
      }
    }
    if (!type)
      continue;
    const region = { type };
    if (author)
      region.author = author;
    if (date)
      region.date = date;
    if (deletionEl)
      region.deletionEl = deletionEl;
    regions.set(id, region);
  }
  return regions;
}
function parsePt(value) {
  if (!value.endsWith("pt"))
    return void 0;
  const n = parseFloat(value.slice(0, -2));
  return isNaN(n) ? void 0 : n;
}
function bytesToBase64(bytes) {
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  const len = bytes.length;
  for (let i2 = 0; i2 < len; i2 += 3) {
    const b0 = bytes[i2];
    const b1 = i2 + 1 < len ? bytes[i2 + 1] : 0;
    const b22 = i2 + 2 < len ? bytes[i2 + 2] : 0;
    result += CHARS[b0 >> 2] + CHARS[(b0 & 3) << 4 | b1 >> 4] + (i2 + 1 < len ? CHARS[(b1 & 15) << 2 | b22 >> 6] : "=") + (i2 + 2 < len ? CHARS[b22 & 63] : "=");
  }
  return result;
}
function extractSpanStyle(textProps, registry) {
  const style = {};
  let hasAny = false;
  const color = textProps.get("fo:color");
  if (color) {
    style.fontColor = color;
    hasAny = true;
  }
  const fontSizeStr = textProps.get("fo:font-size");
  if (fontSizeStr) {
    const pts = parsePt(fontSizeStr);
    if (pts !== void 0) {
      style.fontSize = pts;
      hasAny = true;
    }
  }
  const fontFamily = resolveFontFamily(textProps, registry.fontFaces);
  if (fontFamily) {
    style.fontFamily = fontFamily;
    hasAny = true;
  }
  const highlight = textProps.get("fo:background-color");
  if (highlight && highlight !== "transparent") {
    style.highlightColor = highlight;
    hasAny = true;
  }
  const textTransform = textProps.get("fo:text-transform");
  if (textTransform && textTransform !== "none") {
    style.textTransform = textTransform;
    hasAny = true;
  }
  const fontVariant = textProps.get("fo:font-variant");
  if (fontVariant && fontVariant !== "normal") {
    style.fontVariant = fontVariant;
    hasAny = true;
  }
  const textShadow = textProps.get("fo:text-shadow");
  if (textShadow && textShadow !== "none") {
    style.textShadow = textShadow;
    hasAny = true;
  }
  const letterSpacing = textProps.get("fo:letter-spacing");
  if (letterSpacing && letterSpacing !== "normal") {
    style.letterSpacing = letterSpacing;
    hasAny = true;
  }
  return hasAny ? style : void 0;
}
function extractParagraphStyle(paragraphProps) {
  const style = {};
  let hasAny = false;
  const textAlign = paragraphProps.get("fo:text-align");
  if (textAlign) {
    style.textAlign = textAlign;
    hasAny = true;
  }
  const marginLeft = paragraphProps.get("fo:margin-left");
  if (marginLeft) {
    style.marginLeft = marginLeft;
    hasAny = true;
  }
  const marginRight = paragraphProps.get("fo:margin-right");
  if (marginRight) {
    style.marginRight = marginRight;
    hasAny = true;
  }
  const marginTop = paragraphProps.get("fo:margin-top") ?? paragraphProps.get("fo:space-before");
  if (marginTop) {
    style.marginTop = marginTop;
    hasAny = true;
  }
  const marginBottom = paragraphProps.get("fo:margin-bottom") ?? paragraphProps.get("fo:space-after");
  if (marginBottom) {
    style.marginBottom = marginBottom;
    hasAny = true;
  }
  const paddingLeft = paragraphProps.get("fo:padding-left");
  if (paddingLeft) {
    style.paddingLeft = paddingLeft;
    hasAny = true;
  }
  const paddingRight = paragraphProps.get("fo:padding-right");
  if (paddingRight) {
    style.paddingRight = paddingRight;
    hasAny = true;
  }
  const lineHeight = paragraphProps.get("fo:line-height");
  if (lineHeight) {
    style.lineHeight = lineHeight;
    hasAny = true;
  }
  return hasAny ? style : void 0;
}
function expandBorder(cellProps) {
  const shorthand = cellProps.get("fo:border");
  const top = cellProps.get("fo:border-top") ?? shorthand;
  const bottom = cellProps.get("fo:border-bottom") ?? shorthand;
  const left = cellProps.get("fo:border-left") ?? shorthand;
  const right = cellProps.get("fo:border-right") ?? shorthand;
  if (!top && !bottom && !left && !right)
    return void 0;
  const border = {};
  if (top)
    border.top = top;
  if (bottom)
    border.bottom = bottom;
  if (left)
    border.left = left;
  if (right)
    border.right = right;
  return border;
}
function buildCellStyle(cellProps) {
  const style = {};
  let hasAny = false;
  const bg = cellProps.get("fo:background-color");
  if (bg && bg !== "transparent") {
    style.backgroundColor = bg;
    hasAny = true;
  }
  const border = expandBorder(cellProps);
  if (border) {
    style.border = border;
    hasAny = true;
  }
  const va = cellProps.get("style:vertical-align");
  if (va) {
    style.verticalAlign = va;
    hasAny = true;
  }
  const cw = cellProps.get("style:column-width");
  if (cw) {
    style.columnWidth = cw;
    hasAny = true;
  }
  return hasAny ? style : void 0;
}
var FIELD_TYPE_MAP = {
  "text:date": "date",
  "text:time": "time",
  "text:page-number": "pageNumber",
  "text:page-count": "pageCount",
  "text:author-name": "authorName",
  "text:author-initials": "authorInitials",
  "text:title": "title",
  "text:description": "description",
  "text:subject": "subject",
  "text:keywords": "keywords",
  "text:chapter": "chapter",
  "text:user-defined": "userDefined"
};
function parseSpans(node, ctx, baseStyle = {}, href, baseVisualStyle) {
  const spans = [];
  for (const child of node.children) {
    if (ctx.skipState.skipping) {
      if (child.type === "element") {
        if (child.tag === "text:change-end") {
          const changeId = child.attrs["text:change-id"];
          if (changeId === ctx.skipState.changeId) {
            ctx.skipState.skipping = false;
            ctx.skipState.changeId = void 0;
          }
        }
      }
      continue;
    }
    if (child.type === "text") {
      if (child.text.length > 0) {
        spans.push(makeSpan(child.text, baseStyle, href, baseVisualStyle));
      }
      continue;
    }
    switch (child.tag) {
      case "text:line-break":
        spans.push({ text: "", lineBreak: true });
        break;
      case "text:tab":
        spans.push(makeSpan("	", baseStyle, href, baseVisualStyle));
        break;
      case "text:s": {
        const count = parseInt(child.attrs["text:c"] ?? "1", 10);
        spans.push(makeSpan(" ".repeat(count), baseStyle, href, baseVisualStyle));
        break;
      }
      case "text:span": {
        if (child.attrs["text:display"] === "none")
          break;
        const styleName = child.attrs["text:style-name"];
        const spanStyle = styleName !== void 0 ? ctx.charStyles.get(styleName) ?? {} : {};
        const merged = mergeStyle(baseStyle, spanStyle);
        let childVisualStyle = baseVisualStyle;
        if (styleName) {
          const resolved = resolve(ctx.registry, "text", styleName);
          if (resolved.textProps.get("text:display") === "none")
            break;
          const spanVisual = extractSpanStyle(resolved.textProps, ctx.registry);
          if (spanVisual) {
            childVisualStyle = childVisualStyle ? mergeSpanStyle(childVisualStyle, spanVisual) : spanVisual;
          }
        }
        spans.push(...parseSpans(child, ctx, merged, href, childVisualStyle));
        break;
      }
      case "text:a": {
        const childHref = child.attrs["xlink:href"] ?? href;
        spans.push(...parseSpans(child, ctx, baseStyle, childHref, baseVisualStyle));
        break;
      }
      case "text:bookmark-ref": {
        const refName = child.attrs["text:ref-name"] ?? "";
        const refHref = refName ? `#${refName}` : void 0;
        spans.push(...parseSpans(child, ctx, baseStyle, refHref, baseVisualStyle));
        break;
      }
      case "text:bookmark": {
        const name = child.attrs["text:name"];
        if (name)
          spans.push({ kind: "bookmark", name, position: "point" });
        break;
      }
      case "text:bookmark-start": {
        const name = child.attrs["text:name"];
        if (name)
          spans.push({ kind: "bookmark", name, position: "start" });
        break;
      }
      case "text:bookmark-end": {
        const name = child.attrs["text:name"];
        if (name)
          spans.push({ kind: "bookmark", name, position: "end" });
        break;
      }
      case "text:note": {
        const noteClass = child.attrs["text:note-class"] ?? "footnote";
        const id = child.attrs["text:id"] ?? "";
        const citationEl = findElement(child, "text:note-citation");
        const citation = citationEl ? textContent(citationEl) : "";
        const noteBodyEl = findElement(child, "text:note-body");
        const body = noteBodyEl ? parseBodyNodes(noteBodyEl, ctx) : [];
        const noteNode = { kind: "note", noteClass, id, citation, body };
        spans.push(noteNode);
        break;
      }
      case "draw:frame": {
        const imageEl = findElement(child, "draw:image");
        if (!imageEl)
          break;
        const imageNode = { kind: "image", data: "" };
        const name = child.attrs["draw:name"];
        if (name)
          imageNode.name = name;
        const width = child.attrs["svg:width"];
        if (width)
          imageNode.width = width;
        const height = child.attrs["svg:height"];
        if (height)
          imageNode.height = height;
        const anchorType = child.attrs["text:anchor-type"];
        if (anchorType)
          imageNode.anchorType = anchorType;
        const frameStyleName = child.attrs["draw:style-name"];
        if (frameStyleName) {
          const graphicResolved = resolve(ctx.registry, "graphic", frameStyleName);
          const wrapMode = graphicResolved.graphicProps.get("style:wrap");
          if (wrapMode)
            imageNode.wrapMode = wrapMode;
        }
        const xhref = imageEl.attrs["xlink:href"];
        const mediaType = (xhref ? ctx.manifestTypes.get(xhref) : void 0) ?? imageEl.attrs["loext:mime-type"];
        if (mediaType)
          imageNode.mediaType = mediaType;
        const binaryEl = findElement(imageEl, "office:binary-data");
        if (binaryEl) {
          imageNode.data = textContent(binaryEl).replace(/\s/g, "");
        } else if (xhref) {
          const bytes = ctx.imageBytes.get(xhref);
          if (bytes)
            imageNode.data = bytesToBase64(bytes);
        }
        const titleEl = findElement(child, "svg:title");
        if (titleEl)
          imageNode.title = textContent(titleEl);
        const descEl = findElement(child, "svg:desc");
        if (descEl)
          imageNode.description = textContent(descEl);
        spans.push(imageNode);
        break;
      }
      // ── Tracked-change inline markers ────────────────────────────────────
      case "text:change-start": {
        const changeId = child.attrs["text:change-id"];
        if (!changeId)
          break;
        const region = ctx.changedRegions.get(changeId);
        if (!region)
          break;
        if (ctx.trackedChanges === "original" && region.type === "insertion") {
          ctx.skipState.skipping = true;
          ctx.skipState.changeId = changeId;
        }
        break;
      }
      case "text:change-end": {
        const changeId = child.attrs["text:change-id"];
        if (ctx.skipState.changeId === changeId) {
          ctx.skipState.skipping = false;
          ctx.skipState.changeId = void 0;
        }
        break;
      }
      case "text:change":
        break;
      default: {
        const fieldType = FIELD_TYPE_MAP[child.tag];
        if (fieldType !== void 0) {
          const value = textContent(child);
          const fieldNode = { kind: "field", fieldType, value };
          if (child.attrs["text:fixed"] === "true")
            fieldNode.fixed = true;
          if (fieldType === "userDefined") {
            const fieldName = child.attrs["text:name"];
            if (fieldName)
              fieldNode.name = fieldName;
          }
          spans.push(fieldNode);
          break;
        }
        spans.push(...parseSpans(child, ctx, baseStyle, href, baseVisualStyle));
        break;
      }
    }
  }
  return spans;
}
function parseList(listEl, ctx) {
  const styleName = listEl.attrs["text:style-name"] ?? "";
  const ordered = ctx.listOrdered.get(styleName) ?? false;
  const items = [];
  for (const child of listEl.children) {
    if (child.type !== "element" || child.tag !== "text:list-item")
      continue;
    let spans = [];
    let nested;
    for (const itemChild of child.children) {
      if (itemChild.type !== "element")
        continue;
      if (itemChild.tag === "text:p" || itemChild.tag === "text:h") {
        const paraStyleName = itemChild.attrs["text:style-name"];
        const paraBaseStyle = paraStyleName !== void 0 ? ctx.charStyles.get(paraStyleName) ?? {} : {};
        let baseVisualStyle;
        if (paraStyleName) {
          const resolved = resolve(ctx.registry, "paragraph", paraStyleName);
          baseVisualStyle = extractSpanStyle(resolved.textProps, ctx.registry);
        }
        spans = spans.concat(parseSpans(itemChild, ctx, paraBaseStyle, void 0, baseVisualStyle));
      } else if (itemChild.tag === "text:list") {
        nested = parseList(itemChild, ctx);
      }
    }
    const item = { spans };
    if (nested !== void 0)
      item.children = nested;
    items.push(item);
  }
  return { kind: "list", ordered, items };
}
function deriveCellSpans(body) {
  const spans = [];
  for (const node of body) {
    if (node.kind === "paragraph" || node.kind === "heading") {
      spans.push(...node.spans);
    }
  }
  return spans;
}
function collectColumnStyles(container, out) {
  for (const child of container.children) {
    if (child.type !== "element")
      continue;
    switch (child.tag) {
      case "table:table-column": {
        const colStyleName = child.attrs["table:style-name"] ?? "";
        const repeated = parseInt(child.attrs["table:number-columns-repeated"] ?? "1", 10);
        for (let i2 = 0; i2 < repeated; i2++)
          out.push(colStyleName);
        break;
      }
      case "table:table-column-group":
      case "table:table-columns":
      case "table:table-header-columns":
        collectColumnStyles(child, out);
        break;
      default:
        break;
    }
  }
}
function parseRow(rowEl, ctx, columnStyleNames, isHeader) {
  let rowStyle;
  const rowStyleName = rowEl.attrs["table:style-name"];
  if (rowStyleName) {
    const resolved = resolve(ctx.registry, "table-row", rowStyleName);
    const bg = resolved.cellProps.get("fo:background-color");
    if (bg && bg !== "transparent")
      rowStyle = { backgroundColor: bg };
  }
  const cells = [];
  let colIndex = 0;
  for (const cellEl of rowEl.children) {
    if (cellEl.type !== "element")
      continue;
    if (cellEl.tag === "table:covered-table-cell") {
      colIndex++;
      continue;
    }
    if (cellEl.tag !== "table:table-cell")
      continue;
    const colSpan = parseInt(cellEl.attrs["table:number-columns-spanned"] ?? "1", 10);
    const rowSpan = parseInt(cellEl.attrs["table:number-rows-spanned"] ?? "1", 10);
    const cellStyleName = cellEl.attrs["table:style-name"];
    let cellStyle;
    let cellTextStyle;
    if (cellStyleName) {
      const resolved = resolve(ctx.registry, "table-cell", cellStyleName);
      cellStyle = buildCellStyle(resolved.cellProps);
      cellTextStyle = extractSpanStyle(resolved.textProps, ctx.registry);
    }
    if (!cellStyle?.columnWidth && colIndex < columnStyleNames.length) {
      const colStyleName = columnStyleNames[colIndex];
      if (colStyleName) {
        const colResolved = resolve(ctx.registry, "table-column", colStyleName);
        const cw = colResolved.cellProps.get("style:column-width");
        if (cw) {
          cellStyle = cellStyle ?? {};
          cellStyle.columnWidth = cw;
        }
      }
    }
    const cellBody = parseBodyNodes(cellEl, ctx);
    const spans = deriveCellSpans(cellBody);
    const cell = { spans, body: cellBody };
    if (colSpan > 1)
      cell.colSpan = colSpan;
    if (rowSpan > 1)
      cell.rowSpan = rowSpan;
    if (cellStyleName)
      cell.styleName = cellStyleName;
    if (cellTextStyle)
      cell.textStyle = cellTextStyle;
    if (cellStyle)
      cell.cellStyle = cellStyle;
    cells.push(cell);
    colIndex += colSpan;
  }
  const row = { cells, isHeader };
  if (rowStyle)
    row.rowStyle = rowStyle;
  return row;
}
function collectRows(container, ctx, columnStyleNames, inHeader, out) {
  for (const child of container.children) {
    if (child.type !== "element")
      continue;
    switch (child.tag) {
      case "table:table-row":
        out.push(parseRow(child, ctx, columnStyleNames, inHeader));
        break;
      case "table:table-header-rows":
        collectRows(child, ctx, columnStyleNames, true, out);
        break;
      case "table:table-row-group":
      case "table:table-rows":
        collectRows(child, ctx, columnStyleNames, inHeader, out);
        break;
      default:
        break;
    }
  }
}
function parseTable(tableEl, ctx) {
  const tableStyleName = tableEl.attrs["table:style-name"];
  const columnStyleNames = [];
  collectColumnStyles(tableEl, columnStyleNames);
  const rows = [];
  collectRows(tableEl, ctx, columnStyleNames, false, rows);
  const tableNode = { kind: "table", rows };
  if (tableStyleName)
    tableNode.styleName = tableStyleName;
  return tableNode;
}
function parseBodyNodes(bodyTextEl, ctx) {
  const nodes = [];
  for (const child of bodyTextEl.children) {
    if (child.type !== "element")
      continue;
    if (ctx.skipState.skipping) {
      if (child.tag === "text:change-end") {
        const changeId = child.attrs["text:change-id"];
        if (changeId === ctx.skipState.changeId) {
          ctx.skipState.skipping = false;
          ctx.skipState.changeId = void 0;
        }
      }
      continue;
    }
    const dest = ctx.collectState.collecting ? ctx.collectState.buffer : nodes;
    switch (child.tag) {
      case "text:p": {
        const paraStyleName = child.attrs["text:style-name"];
        const paraBaseStyle = paraStyleName !== void 0 ? ctx.charStyles.get(paraStyleName) ?? {} : {};
        let textStyle;
        let paragraphStyle;
        if (paraStyleName) {
          const resolved = resolve(ctx.registry, "paragraph", paraStyleName);
          textStyle = extractSpanStyle(resolved.textProps, ctx.registry);
          paragraphStyle = extractParagraphStyle(resolved.paragraphProps);
        }
        const para = {
          kind: "paragraph",
          spans: parseSpans(child, ctx, paraBaseStyle, void 0, textStyle)
        };
        if (paraStyleName)
          para.styleName = paraStyleName;
        if (textStyle)
          para.textStyle = textStyle;
        if (paragraphStyle)
          para.paragraphStyle = paragraphStyle;
        dest.push(para);
        break;
      }
      case "text:h": {
        const rawLevel = parseInt(child.attrs["text:outline-level"] ?? "1", 10);
        const level = Math.min(Math.max(rawLevel, 1), 6);
        const headingStyleName = child.attrs["text:style-name"];
        const headingBaseStyle = headingStyleName !== void 0 ? ctx.charStyles.get(headingStyleName) ?? {} : {};
        let textStyle;
        let paragraphStyle;
        if (headingStyleName) {
          const resolved = resolve(ctx.registry, "paragraph", headingStyleName);
          textStyle = extractSpanStyle(resolved.textProps, ctx.registry);
          paragraphStyle = extractParagraphStyle(resolved.paragraphProps);
        }
        const heading = {
          kind: "heading",
          level,
          spans: parseSpans(child, ctx, headingBaseStyle, void 0, textStyle)
        };
        if (headingStyleName)
          heading.styleName = headingStyleName;
        if (textStyle)
          heading.textStyle = textStyle;
        if (paragraphStyle)
          heading.paragraphStyle = paragraphStyle;
        dest.push(heading);
        break;
      }
      case "text:list":
        dest.push(parseList(child, ctx));
        break;
      case "table:table":
        dest.push(parseTable(child, ctx));
        break;
      case "text:section": {
        const sectionName = child.attrs["text:name"];
        const sectionBody = parseBodyNodes(child, ctx);
        const sectionNode = { kind: "section", body: sectionBody };
        if (sectionName)
          sectionNode.name = sectionName;
        dest.push(sectionNode);
        break;
      }
      // ── Block-level tracked-change markers ──────────────────────────────
      case "text:change": {
        const changeId = child.attrs["text:change-id"];
        if (!changeId)
          break;
        const region = ctx.changedRegions.get(changeId);
        if (!region)
          break;
        if (ctx.trackedChanges === "original" && region.type === "deletion") {
          if (region.deletionEl) {
            nodes.push(...parseBodyNodes(region.deletionEl, ctx));
          }
        } else if (ctx.trackedChanges === "changes") {
          const body = region.type === "deletion" && region.deletionEl ? parseBodyNodes(region.deletionEl, ctx) : [];
          const tcNode = {
            kind: "tracked-change",
            changeType: region.type,
            changeId,
            body
          };
          if (region.author)
            tcNode.author = region.author;
          if (region.date)
            tcNode.date = region.date;
          nodes.push(tcNode);
        }
        break;
      }
      case "text:change-start": {
        const changeId = child.attrs["text:change-id"];
        if (!changeId)
          break;
        const region = ctx.changedRegions.get(changeId);
        if (!region)
          break;
        if (ctx.trackedChanges === "original" && region.type === "insertion") {
          ctx.skipState.skipping = true;
          ctx.skipState.changeId = changeId;
        } else if (ctx.trackedChanges === "changes" && region.type === "insertion") {
          ctx.collectState.collecting = true;
          ctx.collectState.changeId = changeId;
          ctx.collectState.buffer = [];
          ctx.collectState.region = region;
        }
        break;
      }
      case "text:change-end": {
        const changeId = child.attrs["text:change-id"];
        if (ctx.collectState.collecting && changeId === ctx.collectState.changeId && ctx.collectState.region) {
          const region = ctx.collectState.region;
          const tcNode = {
            kind: "tracked-change",
            changeType: "insertion",
            changeId: ctx.collectState.changeId,
            body: ctx.collectState.buffer
          };
          if (region.author)
            tcNode.author = region.author;
          if (region.date)
            tcNode.date = region.date;
          nodes.push(tcNode);
          ctx.collectState.collecting = false;
          ctx.collectState.changeId = void 0;
          ctx.collectState.buffer = [];
          ctx.collectState.region = void 0;
        }
        break;
      }
      case "text:tracked-changes":
        break;
    }
  }
  return nodes;
}
function parsePageLayout(stylesRoot) {
  const masterStylesEl = findElement(stylesRoot, "office:master-styles");
  if (!masterStylesEl)
    return void 0;
  let masterPage;
  for (const child of masterStylesEl.children) {
    if (child.type !== "element" || child.tag !== "style:master-page")
      continue;
    if (!masterPage || child.attrs["style:name"] === "Standard") {
      masterPage = child;
    }
    if (child.attrs["style:name"] === "Standard")
      break;
  }
  if (!masterPage)
    return void 0;
  const layoutName = masterPage.attrs["style:page-layout-name"];
  if (!layoutName)
    return void 0;
  const autoStylesEl = findElement(stylesRoot, "office:automatic-styles");
  if (!autoStylesEl)
    return void 0;
  let pageLayoutEl;
  for (const child of autoStylesEl.children) {
    if (child.type === "element" && child.tag === "style:page-layout" && child.attrs["style:name"] === layoutName) {
      pageLayoutEl = child;
      break;
    }
  }
  if (!pageLayoutEl)
    return void 0;
  const propsEl = findElement(pageLayoutEl, "style:page-layout-properties");
  if (!propsEl)
    return void 0;
  const layout = {};
  let hasAny = false;
  const width = propsEl.attrs["fo:page-width"];
  if (width) {
    layout.width = width;
    hasAny = true;
  }
  const height = propsEl.attrs["fo:page-height"];
  if (height) {
    layout.height = height;
    hasAny = true;
  }
  const mt = propsEl.attrs["fo:margin-top"];
  if (mt) {
    layout.marginTop = mt;
    hasAny = true;
  }
  const mb = propsEl.attrs["fo:margin-bottom"];
  if (mb) {
    layout.marginBottom = mb;
    hasAny = true;
  }
  const ml = propsEl.attrs["fo:margin-left"];
  if (ml) {
    layout.marginLeft = ml;
    hasAny = true;
  }
  const mr = propsEl.attrs["fo:margin-right"];
  if (mr) {
    layout.marginRight = mr;
    hasAny = true;
  }
  if (layout.width && layout.height) {
    const w = parseFloat(layout.width);
    const h = parseFloat(layout.height);
    if (!isNaN(w) && !isNaN(h)) {
      layout.orientation = w > h ? "landscape" : "portrait";
      hasAny = true;
    }
  }
  return hasAny ? layout : void 0;
}
function parseMasterPageContent(stylesRoot, ctx) {
  const result = {};
  const masterStylesEl = findElement(stylesRoot, "office:master-styles");
  if (!masterStylesEl)
    return result;
  let masterPage;
  for (const child of masterStylesEl.children) {
    if (child.type !== "element" || child.tag !== "style:master-page")
      continue;
    if (!masterPage || child.attrs["style:name"] === "Standard") {
      masterPage = child;
    }
    if (child.attrs["style:name"] === "Standard")
      break;
  }
  if (!masterPage)
    return result;
  const headerEl = findElement(masterPage, "style:header");
  if (headerEl) {
    const body = parseBodyNodes(headerEl, ctx);
    if (body.length > 0)
      result.header = body;
  }
  const footerEl = findElement(masterPage, "style:footer");
  if (footerEl) {
    const body = parseBodyNodes(footerEl, ctx);
    if (body.length > 0)
      result.footer = body;
  }
  const firstHeaderEl = findElement(masterPage, "style:header-first");
  if (firstHeaderEl) {
    const body = parseBodyNodes(firstHeaderEl, ctx);
    if (body.length > 0)
      result.firstPageHeader = body;
  }
  const firstFooterEl = findElement(masterPage, "style:footer-first");
  if (firstFooterEl) {
    const body = parseBodyNodes(firstFooterEl, ctx);
    if (body.length > 0)
      result.firstPageFooter = body;
  }
  return result;
}
function parseMetaXml(metaXml) {
  const root = parseXml(metaXml);
  const metaEl = findElement(root, "office:meta");
  if (!metaEl)
    return {};
  const metadata = {};
  const titleEl = findElement(metaEl, "dc:title");
  if (titleEl)
    metadata.title = textContent(titleEl);
  const creatorEl = findElement(metaEl, "dc:creator");
  if (creatorEl)
    metadata.creator = textContent(creatorEl);
  const descEl = findElement(metaEl, "dc:description");
  if (descEl)
    metadata.description = textContent(descEl);
  const creationEl = findElement(metaEl, "meta:creation-date");
  if (creationEl)
    metadata.creationDate = textContent(creationEl);
  const modEl = findElement(metaEl, "dc:date");
  if (modEl)
    metadata.modificationDate = textContent(modEl);
  return metadata;
}
function readOdt(bytes, options) {
  const trackedChanges = options?.trackedChanges ?? "final";
  const zip = unzipSync(bytes);
  const contentXmlBytes = zip["content.xml"];
  if (!contentXmlBytes)
    throw new Error("readOdt: content.xml not found in ODT file");
  const contentXml = strFromU8(contentXmlBytes);
  const metaXmlBytes = zip["meta.xml"];
  const metadata = metaXmlBytes ? parseMetaXml(strFromU8(metaXmlBytes)) : {};
  const contentRoot = parseXml(contentXml);
  const stylesXmlBytes = zip["styles.xml"];
  const stylesRoot = stylesXmlBytes ? parseXml(strFromU8(stylesXmlBytes)) : void 0;
  const imageBytes = /* @__PURE__ */ new Map();
  for (const [path, entry] of Object.entries(zip)) {
    if (path.startsWith("Pictures/")) {
      imageBytes.set(path, entry);
    }
  }
  const manifestBytes = zip["META-INF/manifest.xml"];
  const manifestTypes = manifestBytes ? parseManifest(strFromU8(manifestBytes)) : /* @__PURE__ */ new Map();
  const { charStyles, listOrdered } = buildStyleMaps(contentRoot, stylesRoot);
  const registry = buildRegistry(contentRoot, stylesRoot);
  const bodyEl = findElement(contentRoot, "office:body");
  const bodyTextEl = bodyEl ? findElement(bodyEl, "office:text") : void 0;
  const changedRegions = bodyTextEl ? parseChangedRegions(bodyTextEl) : /* @__PURE__ */ new Map();
  const ctx = {
    charStyles,
    listOrdered,
    registry,
    imageBytes,
    manifestTypes,
    changedRegions,
    trackedChanges,
    skipState: { skipping: false },
    collectState: { collecting: false, buffer: [] }
  };
  const body = bodyTextEl ? parseBodyNodes(bodyTextEl, ctx) : [];
  const pageLayout = stylesRoot ? parsePageLayout(stylesRoot) : void 0;
  const masterPageContent = stylesRoot ? parseMasterPageContent(stylesRoot, ctx) : {};
  return {
    metadata,
    body,
    ...pageLayout && { pageLayout },
    ...masterPageContent.header && { header: masterPageContent.header },
    ...masterPageContent.footer && { footer: masterPageContent.footer },
    ...masterPageContent.firstPageHeader && {
      firstPageHeader: masterPageContent.firstPageHeader
    },
    ...masterPageContent.firstPageFooter && {
      firstPageFooter: masterPageContent.firstPageFooter
    },
    toHtml(htmlOptions) {
      return renderHtml(body, htmlOptions);
    }
  };
}

// node_modules/odf-kit/dist/reader/index.js
function odtToHtml(bytes, options, readOptions) {
  return readOdt(bytes, readOptions).toHtml(options);
}
export {
  odtToHtml
};
