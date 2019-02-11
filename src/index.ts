export interface Const<T> {
  readonly _const: T;
}

export interface Generic {
  opaque: 'Generic is a token type that is going to be replaced with a real type';
}

export interface Unit {
  opaque: 'opaque token for empty payload type';
}

export type Case<T> = Of<T> | Const<T>;

export interface RecordDict {
  readonly [key: string]: Case<unknown>;
}

export interface ForbidDefault {
  default?: never;
}

export type ForbidReservedProps = {
  readonly if?: never;
  readonly match?: never;
  readonly T?: never;
} & ForbidDefault;

export type RequiredRecordType = RecordDict & ForbidReservedProps;

export interface Of<T> {
  _opaque: T;
}

export interface Types {
  (unit: null): Of<[Unit]>;
  <T = void>(): Of<[T]>;
  (g: Generic): Of<[Generic]>;
  <T>(val: T): Const<T>;
  <T1, T2>(): Of<[T1, T2]>;
  <T1, T2, T3>(): Of<[T1, T2, T3]>;
}

export const of: Types = ((val: any) => val) as any;

// --------------------------------------------------------
export interface UnionVal<Record> {
  readonly _opaqueToken: Record;
}
export interface UnionValG<P, Record> {
  readonly _opaqueToken: Record;
  readonly _type: P;
}

export type GenericValType<Type, Val> = Val extends UnionValG<
  infer _Type,
  infer Rec
>
  ? UnionValG<Type, Rec>
  : never;

// --------------------------------------------------------
export type Constructors<Record> = {
  [T in keyof Record]: CreatorFunc<Record[T], UnionVal<Record>>
};

export type ConstructorsG<Record> = {
  [K in keyof Record]: CreatorFuncG<Record[K], Record>
};

// --------------------------------------------------------
export type Cases<Record, Result> = {
  [T in keyof Record]: MatchCaseFunc<Record[T], Result>
};

export type CasesG<Record, Result, P> = {
  [K in keyof Record]: MatchCaseFuncG<Record[K], Result, P>
};

// --------------------------------------------------------
export type CreatorFunc<K, UVal> = K extends Of<infer A>
  ? A extends [void]
    ? () => UVal
    : A extends [Unit]
    ? UVal
    : A extends any[]
    ? (...p: A) => UVal
    : never
  : K extends Const<unknown>
  ? () => UVal
  : never;

export type CreatorFuncG<K, Rec> = K extends Of<infer A>
  ? A extends [void]
    ? <P = never>() => UnionValG<P, Rec>
    : A extends [Unit]
    ? <P = never>() => UnionValG<P, Rec>
    : A extends [Generic]
    ? <P>(val: P) => UnionValG<P, Rec>
    : A extends any[]
    ? <P = never>(...p: A) => UnionValG<P, Rec>
    : never
  : K extends Const<unknown>
  ? <P = never>() => UnionValG<P, Rec>
  : never;

// --------------------------------------------------------
export type MatchCaseFunc<K, Res> = K extends Of<infer A>
  ? A extends [void]
    ? () => Res
    : A extends [Unit]
    ? () => Res
    : A extends any[]
    ? (...p: A) => Res
    : never
  : K extends Const<infer C>
  ? (c: C) => Res
  : never;

export type MatchCaseFuncG<K, Res, P> = K extends Of<infer A>
  ? A extends [void]
    ? () => Res
    : A extends [Unit]
    ? () => Res
    : A extends [Generic]
    ? (val: P) => Res
    : A extends any[]
    ? (...p: A) => Res
    : never
  : K extends Const<infer C>
  ? (c: C) => Res
  : never;

// --------------------------------------------------------
export type MatchCases<Record, Result> =
  | Cases<Record, Result> & ForbidDefault
  | Partial<Cases<Record, Result>> & {
      default: (val: UnionVal<Record>) => Result;
    };

export type MatchCasesG<Rec, Result, P> =
  | CasesG<Rec, Result, P> & ForbidDefault
  | Partial<CasesG<Rec, Result, P>> & {
      default: (val: UnionValG<P, Rec>) => Result;
    };

// --------------------------------------------------------
export interface MatchFunc<Record> {
  <Result>(cases: MatchCases<Record, Result>): (
    val: UnionVal<Record>
  ) => Result;
  <Result>(val: UnionVal<Record>, cases: MatchCases<Record, Result>): Result;
}
export interface MatchFuncG<Record> {
  <Result, P>(cases: MatchCasesG<Record, Result, P>): (
    val: UnionValG<P, Record>
  ) => Result;
  <Result, P>(
    val: UnionValG<P, Record>,
    cases: MatchCasesG<Record, Result, P>
  ): Result;
}

// --------------------------------------------------------
export type UnpackFunc<K, Rec> = K extends Of<infer A>
  ? A extends [void]
    ? {
        <R>(val: UnionVal<Rec>, f: () => R): R | undefined;
        <R>(val: UnionVal<Rec>, f: () => R, els: (v: UnionVal<Rec>) => R): R;
      }
    : A extends [Unit]
    ? {
        <R>(val: UnionVal<Rec>, f: () => R): R | undefined;
        <R>(val: UnionVal<Rec>, f: () => R, els: (v: UnionVal<Rec>) => R): R;
      }
    : A extends any[]
    ? {
        <R>(val: UnionVal<Rec>, f: (...p: A) => R): R | undefined;
        <R>(
          val: UnionVal<Rec>,
          f: (...p: A) => R,
          els: (v: UnionVal<Rec>) => R
        ): R;
      }
    : never
  : K extends Const<infer С>
  ? {
      <R>(val: UnionVal<Rec>, f: (с: С) => R): R | undefined;
      <R>(val: UnionVal<Rec>, f: (с: С) => R, els: (v: UnionVal<Rec>) => R): R;
    }
  : never;

export type UnpackFuncG<K, Rec> = K extends Of<infer A>
  ? A extends [void]
    ? {
        <R, P>(val: UnionValG<P, Rec>, f: () => R): R | undefined;
        <R, P>(
          val: UnionValG<P, Rec>,
          f: () => R,
          els: (v: UnionValG<P, Rec>) => R
        ): R;
      }
    : A extends [Unit]
    ? {
        <R, P>(val: UnionValG<P, Rec>, f: () => R): R | undefined;
        <R, P>(
          val: UnionValG<P, Rec>,
          f: () => R,
          els: (v: UnionValG<P, Rec>) => R
        ): R;
      }
    : A extends [Generic]
    ? {
        <R, P>(val: UnionValG<P, Rec>, f: (val: P) => R): R | undefined;
        <R, P>(
          val: UnionValG<P, Rec>,
          f: (val: P) => R,
          els: (v: UnionValG<P, Rec>) => R
        ): R;
      }
    : A extends any[]
    ? {
        <R, P>(val: UnionValG<P, Rec>, f: (...p: A) => R): R | undefined;
        <R, P>(
          val: UnionValG<P, Rec>,
          f: (...p: A) => R,
          els: (v: UnionValG<P, Rec>) => R
        ): R;
      }
    : never
  : K extends Const<infer С>
  ? {
      <R, P>(val: UnionValG<P, Rec>, f: (с: С) => R): R | undefined;
      <R, P>(
        val: UnionValG<P, Rec>,
        f: (с: С) => R,
        els: (v: UnionValG<P, Rec>) => R
      ): R;
    }
  : never;

// --------------------------------------------------------
export type Unpack<Rec> = { [K in keyof Rec]: UnpackFunc<Rec[K], Rec> };
export type UnpackG<Rec> = { [K in keyof Rec]: UnpackFuncG<Rec[K], Rec> };

// --------------------------------------------------------
export type UnionObj<Rec> = {
  match: MatchFunc<Rec>;
  if: Unpack<Rec>;
  T: UnionVal<Rec>;
} & Constructors<Rec>;

export type GenericUnionObj<Rec> = {
  match: MatchFuncG<Rec>;
  if: UnpackG<Rec>;
  T: UnionValG<unknown, Rec>;
} & ConstructorsG<Rec>;

// --------------------------------------------------------

export interface UnionFunc {
  <R extends RequiredRecordType>(record: R): UnionObj<R>;
  <R extends RequiredRecordType>(ctor: (g: Generic) => R): GenericUnionObj<R>;
}

export const Union: UnionFunc = <R extends RequiredRecordType>(
  recOrFunc: ((g: Generic) => R) | R
) => {
  const record =
    typeof recOrFunc === 'function'
      ? recOrFunc((undefined as unknown) as Generic)
      : recOrFunc;

  // tslint:disable-next-line:prefer-object-spread
  return Object.assign(
    { if: createUnpack(record), match },
    createConstructors(record, typeof recOrFunc === 'function')
  ) as any;
};

const evalMatch = <Record extends RecordDict>(
  val: any,
  cases: MatchCases<Record, unknown>
): any => {
  // first elem is always the key
  const handler = cases[getKey(val)] as any;
  return handler
    ? handler(...getParams(val))
    : cases.default && cases.default(val);
};

// const f = (n: number, n2: number) => n + n2;

// const f2 = f.call(undefined, [1]);
const match: MatchFunc<unknown> = (a: any, b?: any) =>
  b ? evalMatch(a, b) : (val: any) => evalMatch(val, a);

const createConstructors = <Record extends RecordDict>(
  rec: Record,
  isGeneric: boolean
): Constructors<Record> => {
  const result: Partial<Constructors<Record>> = {};
  // tslint:disable-next-line: forin
  for (const key in rec) {
    result[key] = createCtor(key, rec, isGeneric);
  }
  return result as Constructors<Record>;
};

const createCtor = <K extends keyof Record, Record extends RecordDict>(
  key: K,
  rec: Record,
  isGeneric: boolean
): CreatorFunc<Record[K], UnionVal<Record>> => {
  const val: Case<unknown> = rec[key];

  // it means that it was constructed with of(null)
  if (val === null) {
    const frozenVal = Object.freeze(makeVal(key, [])) as any;
    return isGeneric ? () => frozenVal : frozenVal;
  }

  // tslint:disable-next-line:no-if-statement
  if (val !== undefined) {
    const res: ReadonlyArray<any> = makeVal(key, [val]) as any;
    return ((() => res) as any) as any;
  }

  return ((...args: any[]) => makeVal(key, args)) as any;
};

const createUnpack = <Record extends RecordDict>(
  rec: Record
): Unpack<Record> => {
  const result: Partial<Unpack<Record>> = {};
  // tslint:disable-next-line:forin
  for (const key in rec) {
    result[key] = createUnpackFunc(key);
  }
  return result as Unpack<Record>;
};

const createUnpackFunc = <K extends keyof Record, Record extends RecordDict>(
  key: K
): UnpackFunc<Record[K], Record> =>
  ((val: any, f: (...args: any[]) => any, els?: (v: any) => any) =>
    getKey(val) === key ? f(...getParams(val)) : els && els(val)) as any;

const makeVal = (k: any, p: any) => ({ k, p });
const getKey = (val: any) => val.k;
const getParams = (val: any) => val.p;
