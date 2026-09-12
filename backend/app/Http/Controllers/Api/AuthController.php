<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller; use App\Models\User; use Illuminate\Http\Request; use Illuminate\Support\Facades\Hash;
class AuthController extends Controller { public function login(Request $r){$v=$r->validate(['email'=>'required|email','password'=>'required']);$u=User::where('email',$v['email'])->first();if(!$u||!Hash::check($v['password'],$u->password))return response()->json(['message'=>'Invalid credentials'],422);return ['token'=>$u->createToken('sadya-admin')->plainTextToken,'user'=>$u];} public function logout(Request $r){$r->user()->currentAccessToken()->delete();return ['message'=>'Logged out'];} }
