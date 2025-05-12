<?php

namespace App\Providers;

use App\Models\Movies;
use App\Models\User;
use App\Policies\MoviesPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Request;

class AuthServiceProvider extends ServiceProvider
{

    public function boot()
    {
        //
    }
}
