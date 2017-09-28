import { ConditionId } from './template';

export type TODO = any;
export type Diff<T extends string, U extends string> = ({[P in T]: P } & {[P in U]: never } & { [x: string]: never })[T];
export type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;

export type CFString = string;
export type CFBoolean = 'true' | 'false';
export type CFInteger = string;
export type CFDouble = string;
export type CFLong = string;
export type CFTimestamp = string; // TODO
export type CFJson = object; // TODO
export type CFList<T> = Array<T>;
export type CFMap<T> = {[key: string]: T};

export type LiteralOrRef<V = any> = V | Ref;

function factory<FnType, Key extends keyof FnType>(key: Key) {
    return function(v: FnType[Key]): FnType {
        return { [key]: v } as any as FnType;
    };
}

export namespace Functions {
    export const Base64 = factory<Base64, 'Fn::Base64'>('Fn::Base64');
    export interface Base64 {
        'Fn::Base64': Yields<CFString>;
    }
    export function FindInMap<V>(v: FindInMap<V>['Fn::FindInMap']): FindInMap<V> {
        return {'Fn::FindInMap': v};
    }
    export interface FindInMap<V> {
        'Fn::FindInMap': [Yields<CFString>, Yields<CFString>, Yields<CFString>];
    }
    export const GetAtt = factory<GetAtt, 'Fn::GetAtt'>('Fn::GetAtt');
    export interface GetAtt {
        'Fn::GetAtt': [CFString, LiteralOrRef<CFString>];
    }
    export const GetAZs = factory<GetAZs, 'Fn::GetAZs'>('Fn::GetAZs');
    export interface GetAZs {
        'Fn::GetAZs': LiteralOrRef<CFString>;
    }
    export function ImportValue<V>(v: ImportValue<V>['Fn::ImportValue']): ImportValue<V> {
        return {'Fn::ImportValue': v};
    }
    export interface ImportValue<V> {
        'Fn::ImportValue': Yields<CFString>;
    }
    export const Join = factory<Join, 'Fn::Join'>('Fn::Join');
    export interface Join {
        'Fn::Join': [CFString, Yields<Array<Yields<CFString>>>];
    }
    export function Select<V>(v: Select<V>['Fn::Select']): Select<V> {
        return {'Fn::Select': v};
    }
    export interface Select<V> {
        'Fn::Select': [Yields<CFInteger>, Yields<Array<Yields<V>>>];
    }
    export const Split = factory<Split, 'Fn::Split'>('Fn::Split');
    export interface Split {
        'Fn::Split': [CFString, Yields<CFString>];
    }
    export const Sub = factory<Sub, 'Fn::Sub'>('Fn::Sub');
    export interface Sub {
        'Fn::Sub': [Yields<CFString>, Yields<CFMap<Yields<CFString>>>] | Yields<CFString>;
    };

    export const And = factory<And, 'Fn::And'>('Fn::And');
    export interface And {
        'Fn::And': Array<BooleanCondition>;
    }
    export const Equals = factory<Equals, 'Fn::Equals'>('Fn::Equals');
    export interface Equals {
        'Fn::Equals': [Yields<any>, Yields<any>]
    }
    export function If<V>(v: If<V>['Fn::If']): If<V> {
        return {'Fn::If': v};
    }
    export interface If<V> {
        'Fn::If': [ConditionId, Yields<V>, Yields<V>];
    }
    export const Not = factory<Not, 'Fn::Not'>('Fn::Not');
    export interface Not {
        'Fn::Not': [BooleanCondition]
    }
    export const Or = factory<Or, 'Fn::Or'>('Fn::Or');
    export interface Or {
        'Fn::Or': Array<BooleanCondition>;
    };
}

export type BooleanCondition = Functions.And | Functions.Equals | Functions.Not | Functions.Or | ConditionRef;

export interface ConditionRef {
    Condition: ConditionId;
}

/**
 * Yields a value of type V.  In other words, can appear in the JSON where that type of value is expected and where functions are allowed to execute.
 * Can be a function that returns the value, or can be the literal value itself.
 */
// export type YieldsBrand<V> = V | ReturnsBrand<V>;

export type Yields<V> = V | Returns<V>;
export type Returns<V> = Functions.Select<V> | Functions.If<V> | Ref;
export type YieldsBoolean = Yields<CFBoolean> | ReturnsBoolean;
export type ReturnsBoolean = Returns<CFBoolean> | Functions.And | Functions.Equals | Functions.Not | Functions.Or | ConditionRef;
export type YieldsString = Yields<CFString> | ReturnsString;
export type ReturnsString = Returns<CFString> | Functions.Base64 | Functions.Join | Functions.Sub;

/**
 * This is some sort of function or reference that ultimately yields a value of type V.
 * Allows the type system to understand what type a condition, value, reference, etc. will return.
 */
// interface ReturnsBrand<V> {
//     /** DO NOT USE IN CODE.  This is just type system branding. */
//     __brandReturnValue: V;
// }

export interface AbstractResource {
    type: string;
    Condition?: ConditionId;
    // Properties?: {};
    DeletionPolicy?: 'Delete' | 'Retain' | 'Snapshot';
    DependsOn?: CFString | Array<CFString>;
    Metadata?: object;
}

// Add "CreationPolicy" and "UpdatePolicy" support to only the resources that support it
declare module './generated/aws-cloudformation' {
    namespace AWS.AutoScaling {
        interface AutoScalingGroup extends HasCreationPolicy, HasUpdatePolicy {}
    }
    namespace AWS.EC2 {
        interface Instance extends HasCreationPolicy {}
    }
    namespace AWS.CloudFormation {
        interface WaitCondition extends HasCreationPolicy {}
    }
}

export interface HasCreationPolicy {
    CreationPolicy?: {
        AutoScalingCreationPolicy?: {
            MinSuccessfulInstancesPercent?: CFInteger;
        }
        ResourceSignal?: {
            Count?: CFString; // number
            Timeout?: CFInteger;
        }
    };
}

export interface HasUpdatePolicy {
    UpdatePolicy?: {
        AutoScalingRollingUpdate?: {
            MaxBatchSize?: CFInteger;
            MinInstancesInService?: CFInteger;
            MinSuccessfulInstancesPercent?: CFInteger;
            PauseTime: CFString;
            SuspendProcesses?: Array<TODO>;
            WaitOnResourceSignals?: CFBoolean;
        }
        AutoScalingReplacingUpdate?: {
            WillReplace?: CFBoolean;
        }
        AutoScalingScheduledAction?: {
            IgnoreUnmodifiedGroupSizeProperties?: CFBoolean;
        }
    }
}

export interface Ref<K extends CFString = CFString> {
    Ref: K;
}

export function Ref<K extends CFString>(ref: K): Ref<K> {
    return {Ref: ref};
}

// /** A Ref that we know refers to a specific type of value */
// export interface RefReturns<K extends CFString, V> extends Ref<K>, ReturnsBrand<V> {}