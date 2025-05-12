<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(\GuzzleHttp\Client::class, function () {
            return new \GuzzleHttp\Client([
                'verify' => 'H:/laragon/etc/ssl/cacert.pem',
            ]);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
